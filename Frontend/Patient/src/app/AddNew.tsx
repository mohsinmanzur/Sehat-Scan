import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Pressable, Animated, BackHandler, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@context/ThemeContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText, ThemedView } from 'src/components';
import DatePicker from 'react-native-date-picker';
import { Dropdown } from 'src/components/common/Dropdown';
import backend from 'src/services/Backend/backend.service';
import LoadingScreen from 'src/components/LoadingScreen';
import { useCurrentPatient } from '@context/PatientContext';
import { formatOrdinalDate, formatTime } from 'src/utils/date';
import { errorShakeAnimation } from 'src/animations/animations';
import { ScalePressable } from 'src/components/ScalePressable';
import { useGlobalContext } from 'src/context/GlobalContext';
import { Snackbar } from 'react-native-snackbar';
import { MeasurementUnit } from '../types/types';
import { useMeasurementUnits } from '../hooks/useMeasurementUnits';
import { useOfflineMutation } from '../hooks/useOfflineMutation';
import { useNetwork } from '../context/NetworkContext';
import { insertLocalDocument } from '../services/Database/documents.repository';
import { enqueueMutation } from '../services/Database/mutations.repository';
import { saveLocalImageCopy } from '../services/Sync/image.service';
import { useDatabase } from '../context/DatabaseContext';

export default function AddNewMeasurement() {
    const { theme } = useTheme();
    const { currentPatient } = useCurrentPatient();
    const { scannedImage, setScannedImage } = useGlobalContext();
    const { isOnline } = useNetwork();
    const { db } = useDatabase();
    const { createMeasurement } = useOfflineMutation(currentPatient?.id);
    const router = useRouter();

    const [selectedUnit, setSelectedUnit] = useState<MeasurementUnit | null>(null);
    const [value, setValue] = useState('');
    const [value2, setValue2] = useState('');
    const value2Ref = useRef<TextInput>(null);

    const [selectedDate, setSelectedDate] = useState(new Date());

    const [showSelectedUnitError, setShowSelectedUnitError] = useState(false);
    const [showValueError, setShowValueError] = useState(false);

    const [isSaving, setisSaving] = useState(false);

    const [pickerOpen, setPickerOpen] = useState<'date' | 'time' | null>(null);

    const { units, isLoading } = useMeasurementUnits();

    const valueShakeAnimation = useRef(new Animated.Value(0)).current;
    const dropdownShakeAnimation = useRef(new Animated.Value(0)).current;

    const [selectedSpecialConditions, setSelectedSpecialConditions] = useState<string[]>([]);

    const [ocrText, setOcrText] = useState<string>('');
    const [ocrLabel, setOcrLabel] = useState<string | null>(null);
    const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrError, setOcrError] = useState<string | null>(null);

    useEffect(() => {
        if (!scannedImage) {
            setOcrText('');
            setOcrLabel(null);
            setOcrConfidence(null);
            setOcrError(null);
            return;
        }
        let cancelled = false;
        setOcrLoading(true);
        setOcrError(null);
        backend.extractTextFromImage(scannedImage)
            .then((res) => {
                if (cancelled) return;
                setOcrText(res.text);
                setOcrLabel(res.label);
                setOcrConfidence(res.confidence);
            })
            .catch((err) => {
                if (cancelled) return;
                setOcrError(err?.message ?? 'OCR failed');
            })
            .finally(() => {
                if (!cancelled) setOcrLoading(false);
            });
        return () => { cancelled = true; };
    }, [scannedImage]);

    const handleBack = () => {
        router.back();
        setScannedImage(null);
        return true;
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBack
        );
        return () => backHandler.remove();
    }, [router]);

    const handleSave = async () => {
        if (!selectedUnit) {
            if (!value) {
                setShowValueError(true);
                errorShakeAnimation(valueShakeAnimation);
            }
            setShowSelectedUnitError(true);
            errorShakeAnimation(dropdownShakeAnimation);
            return;
        }
        if (!value) {
            setShowValueError(true);
            errorShakeAnimation(valueShakeAnimation);
            return;
        }
        if ((selectedUnit?.has_secondary_value || selectedUnit?.measurement_group === 'Blood Pressure') && !value2) {
            setShowValueError(true);
            errorShakeAnimation(valueShakeAnimation);
            return;
        }
        setShowSelectedUnitError(false);
        setShowValueError(false);

        setisSaving(true);

        try {
            let documentId: string | null = null;

            if (scannedImage) {
                if (isOnline) {
                    // Upload to cloud as before
                    const uploadresponse = await backend.createandUploadMedicalDocument({
                        patient_id: currentPatient?.id || '',
                        record_type: ocrLabel === 'medical prescription' ? 'prescription' : 'other',
                        file: scannedImage,
                        ocr_extracted_text: ocrText || undefined,
                    });
                    documentId = uploadresponse?.id || null;
                } else if (db) {
                    // Save image locally and queue upload for later
                    const localDocId = `local_doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                    const localPath = await saveLocalImageCopy(scannedImage, localDocId);
                    await insertLocalDocument(
                        db,
                        localDocId,
                        localPath,
                        currentPatient?.id || '',
                        ocrLabel === 'medical prescription' ? 'prescription' : 'other',
                        ocrText || undefined
                    );
                    await enqueueMutation(db, {
                        entity_type: 'medical_document',
                        operation: 'create',
                        payload: JSON.stringify({
                            local_file_path: localPath,
                            record_type: ocrLabel === 'medical prescription' ? 'prescription' : 'other',
                            ocr_extracted_text: ocrText || null,
                        }),
                        local_id: localDocId,
                        server_id: null,
                    });
                    documentId = localDocId;
                }
            }

            await createMeasurement({
                patient_id: currentPatient?.id,
                document_id: documentId,
                unit_id: selectedUnit?.id,
                numeric_value: parseFloat(value),
                numeric_value_2: (selectedUnit?.has_secondary_value || selectedUnit?.measurement_group === 'Blood Pressure') ? parseFloat(value2) : undefined,
                created_at: selectedDate,
            });

            router.back();
            Snackbar.show({
                text: isOnline ? 'Measurement added successfully' : 'Saved offline — will sync when connected',
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: theme.primary,
            });
            setScannedImage(null);
        } catch (error) {
            Snackbar.show({
                text: `Failed to add measurement: ${error.message}`,
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: theme.danger,
            });
            throw new Error(error);
        } finally {
            setisSaving(false);
        }
    };

    const handleAddPhoto = () => {
        router.push('health_measurements/Scan');
    }

    const displayDate = formatOrdinalDate(selectedDate);
    const displayTime = formatTime(selectedDate);

    const s = styles(theme);

    return (isLoading ? <LoadingScreen /> :
        <ThemedView safe style={s.root}>
            {/* ── Custom Header ── */}
            <View style={s.header}>
                <TouchableOpacity onPress={handleBack} style={s.headerIcon}>
                    <Ionicons name="arrow-down" size={22} color={theme.textGray} />
                </TouchableOpacity>
                <ThemedText style={s.headerTitle}>Add Measurement</ThemedText>
                <Pressable style={[s.headerIcon, { opacity: 0 }]}>
                    <Ionicons name="ellipsis-vertical" size={20} color={theme.textGray} />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={s.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Measurement Type ── */}
                <Dropdown
                    label="MEASUREMENT TYPE"
                    options={[...new Set(units.map((unit) => unit.measurement_group))]}
                    value={selectedUnit?.measurement_group}
                    onChange={(value) => { setSelectedUnit(units.find((unit) => unit.measurement_group === value) || null); setShowSelectedUnitError(false); }}
                    error={showSelectedUnitError}
                    remainingStyles={{ transform: [{ translateX: dropdownShakeAnimation }] }}
                />

                {/* ── Value & Unit ── */}
                <View style={s.row}>
                    <View style={s.col2}>
                        <Text style={s.label}>VALUE</Text>
                        <Animated.View style={[s.valueBox, { borderColor: showValueError ? theme.danger : theme.card, transform: [{ translateX: valueShakeAnimation }] }]}>
                            <TextInput
                                style={s.valueInput}
                                value={value}
                                onChangeText={(text) => {
                                    setValue(text);
                                    setShowValueError(false);
                                    if (text.length === 3 && (selectedUnit?.has_secondary_value || selectedUnit?.measurement_group === 'Blood Pressure')) {
                                        value2Ref.current?.focus();
                                    }
                                }}
                                keyboardType="phone-pad"
                                returnKeyType={(selectedUnit?.has_secondary_value || selectedUnit?.measurement_group === 'Blood Pressure') ? "next" : "done"}
                                onSubmitEditing={() => {
                                    if (selectedUnit?.has_secondary_value || selectedUnit?.measurement_group === 'Blood Pressure') {
                                        value2Ref.current?.focus();
                                    }
                                }}
                                placeholderTextColor={theme.textVeryLight}
                                placeholder={(selectedUnit?.has_secondary_value || selectedUnit?.measurement_group === 'Blood Pressure') ? '120' : '0'}
                                maxLength={3}
                                cursorColor={theme.primary}
                            />
                        </Animated.View>
                    </View>

                    {(selectedUnit?.has_secondary_value || selectedUnit?.measurement_group === 'Blood Pressure') &&
                        <>
                            <ThemedText style={{ color: theme.textGray, fontSize: 50, marginBottom: 15 }}>/</ThemedText>

                            <View style={{ flex: 0.75 }}>
                                <Animated.View style={[s.valueBox, { borderColor: showValueError ? theme.danger : theme.card, transform: [{ translateX: valueShakeAnimation }] }]}>
                                    <TextInput
                                        ref={value2Ref}
                                        style={s.valueInput}
                                        value={value2}
                                        onChangeText={(text) => { setValue2(text); setShowValueError(false); }}
                                        keyboardType="phone-pad"
                                        placeholderTextColor={theme.textVeryLight}
                                        placeholder='80'
                                        maxLength={3}
                                        cursorColor={theme.primary}
                                    />
                                </Animated.View>
                            </View>
                        </>
                    }

                    <ThemedText style={s.unitText} type={'subtitle'}>{selectedUnit?.symbol}</ThemedText>
                </View>
                {/*
                <View style={s.optionsRow}>
                    <ScalePressable
                        style={[s.optionPill, selectedSpecialConditions.includes('Morning') && s.optionPillActive]}
                        onPress={() => {
                            if (selectedSpecialConditions.includes('Morning')) {
                                setSelectedSpecialConditions(selectedSpecialConditions.filter((condition) => condition !== 'Morning'));
                            } else {
                                setSelectedSpecialConditions([...selectedSpecialConditions, 'Morning']);
                            }
                        }}
                    >
                        <Text style={[s.optionPillText, selectedSpecialConditions.includes('Morning') && s.optionPillTextActive]}>Morning</Text>
                    </ScalePressable>
                </View>*/}

                {/* ── Date & Time ── */}
                <View style={s.row}>
                    <View style={s.col2}>
                        <Text style={s.label}>DATE</Text>
                        <TouchableOpacity
                            style={s.pickerBox}
                            onPress={() => setPickerOpen('date')}
                            activeOpacity={0.75}
                        >
                            <Text style={s.pickerText}>{displayDate}</Text>
                            <Ionicons name="calendar-outline" size={18} color={theme.textGray} />
                        </TouchableOpacity>
                    </View>
                    <View style={s.col2}>
                        <Text style={s.label}>TIME</Text>
                        <TouchableOpacity
                            style={s.pickerBox}
                            onPress={() => setPickerOpen('time')}
                            activeOpacity={0.75}
                        >
                            <Text style={s.pickerText}>{displayTime}</Text>
                            <Ionicons name="time-outline" size={18} color={theme.textGray} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── DatePicker Modal ── */}
                <DatePicker
                    modal
                    open={pickerOpen !== null}
                    date={selectedDate}
                    mode={pickerOpen ?? 'date'}
                    onConfirm={(picked) => {
                        setSelectedDate(picked);
                        setPickerOpen(null);
                    }}
                    onCancel={() => setPickerOpen(null)}
                />

                {/* ── Save Button ── */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 10 }}>
                    <View style={{ flex: 1 }}>
                        <ScalePressable
                            style={[s.saveBtn, { backgroundColor: theme.primary, width: '100%' }]}
                            onPress={handleSave}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={s.saveBtnText}>Save Measurement</Text>
                                    <MaterialIcons name="save" size={20} color="#fff" style={{ marginLeft: 8 }} />
                                </>
                            )}
                        </ScalePressable>
                    </View>

                    <Pressable
                        style={({ pressed }) => [s.iconBox, { backgroundColor: theme.primarySoft, marginRight: 0, marginTop: 8, opacity: pressed ? 0.8 : 1 }]}
                        collapsable={false}
                        onPress={handleAddPhoto}
                    >
                        <MaterialIcons
                            name={scannedImage ? "check" : "add-a-photo"}
                            size={23}
                            color={theme.primary}
                        />
                    </Pressable>
                </View>

                {scannedImage && (
                    <View style={[s.ocrBox, { backgroundColor: theme.card, borderColor: theme.card }]}>
                        <View style={s.ocrHeader}>
                            <MaterialIcons name="text-snippet" size={16} color={theme.primary} />
                            <Text style={[s.ocrTitle, { color: theme.textGray }]}>EXTRACTED TEXT</Text>
                            {ocrLabel && (
                                <Text style={[s.ocrBadge, { color: theme.primary }]}>
                                    {ocrLabel}{ocrConfidence != null ? ` · ${Math.round(ocrConfidence * 100)}%` : ''}
                                </Text>
                            )}
                        </View>
                        {ocrLoading ? (
                            <View style={s.ocrLoading}>
                                <ActivityIndicator color={theme.primary} size="small" />
                                <Text style={[s.ocrHint, { color: theme.textLight }]}>Reading prescription…</Text>
                            </View>
                        ) : ocrError ? (
                            <Text style={[s.ocrHint, { color: theme.danger }]}>{ocrError}</Text>
                        ) : (
                            <TextInput
                                value={ocrText}
                                onChangeText={setOcrText}
                                multiline
                                placeholder="No text detected. You can type notes here."
                                placeholderTextColor={theme.textVeryLight}
                                style={[s.ocrInput, { color: theme.text }]}
                            />
                        )}
                    </View>
                )}

                <Text style={[s.hipaaText, { color: theme.textLight }]}>
                    Data is encrypted and stored securely following HIPAA compliance guidelines.
                </Text>
            </ScrollView>
        </ThemedView>
    );
}

const styles = (theme: any) => StyleSheet.create({
    root: {
        backgroundColor: theme.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 14,
        backgroundColor: theme.backgroundDark,
    },
    headerIcon: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: theme.text,
        fontSize: 17,
        fontFamily: 'Lexend_700Bold',
    },
    scroll: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    /* ── Labels ── */
    label: {
        fontSize: 11,
        fontFamily: 'Lexend_700Bold',
        color: theme.textLight,
        letterSpacing: 0.8,
        marginBottom: 8,
        marginTop: 18,
    },
    iconBox: {
        width: 65,
        height: 65,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    /* ── Row layout ── */
    row: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-end'
    },
    col2: {
        flex: 1,
    },

    /* ── Value box ── */
    valueBox: {
        backgroundColor: theme.card,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        justifyContent: 'center',
        borderWidth: 1
    },
    valueInput: {
        fontSize: 36,
        fontFamily: 'Lexend_800ExtraBold',
        color: theme.text,
        padding: 0,
    },
    unitText: {
        fontSize: 15,
        fontFamily: 'Lexend_700Bold',
        color: theme.textGray,
        alignSelf: 'center',
        marginTop: 35,
    },

    /* ── Picker boxes (date / time) ── */
    pickerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.card,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 14,
        gap: 8,
    },
    pickerText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Lexend_600SemiBold',
        color: theme.text,
    },

    /* ── Save Button ── */
    saveBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        paddingVertical: 18,
        marginTop: 24,
        marginBottom: 16,
    },
    saveBtnText: {
        fontSize: 16,
        fontFamily: 'Lexend_800ExtraBold',
        color: '#fff',
    },

    /* ── Options Pills ── */
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12
    },
    optionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 25,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    optionPillActive: {
        backgroundColor: theme.primarySoft,
        borderColor: theme.primary,
    },
    optionPillText: {
        fontSize: 13,
        fontFamily: 'Lexend_600SemiBold',
        color: theme.textGray,
    },
    optionPillTextActive: {
        color: theme.primary,
    },

    /* ── OCR ── */
    ocrBox: {
        marginTop: 16,
        padding: 14,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
    },
    ocrHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    ocrTitle: {
        fontSize: 11,
        fontFamily: 'Lexend_700Bold',
        letterSpacing: 0.8,
    },
    ocrBadge: {
        marginLeft: 'auto',
        fontSize: 11,
        fontFamily: 'Lexend_700Bold',
    },
    ocrInput: {
        fontSize: 14,
        fontFamily: 'Lexend_400Regular',
        minHeight: 64,
        textAlignVertical: 'top',
        lineHeight: 20,
    },
    ocrLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
    },
    ocrHint: {
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
    },

    /* ── Footer ── */
    hipaaText: {
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 10,
    },
});