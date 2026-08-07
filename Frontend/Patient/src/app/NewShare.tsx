import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, BackHandler, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@context/ThemeContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { CustomTimePickerModal, ThemedText, ThemedTextInput, ThemedView } from 'src/components';
import backend from 'src/services/Backend/backend.service';
import LoadingScreen from 'src/components/LoadingScreen';
import { useCurrentPatient } from '@context/PatientContext';
import { ScalePressable } from 'src/components/ScalePressable';
import { useGlobalContext } from 'src/context/GlobalContext';
import { Snackbar } from 'react-native-snackbar';
import { MeasurementUnit } from '../types/types';
import { Colors } from '@theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddNewMeasurement() {
    const { theme } = useTheme();
    const { currentPatient } = useCurrentPatient()
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [isSaving, setisSaving] = useState(false);

    const { selectedReports, setSelectedReports } = useGlobalContext();
    const [recipientEmail, setRecipientEmail] = useState('');
    const [isShareLoading, setIsShareLoading] = useState(false);
    const [selectedTime, setSelectedTime] = useState({ days: 0, hours: 1, minutes: 0 });
    const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

    const handleBack = () => {
        router.back();
        setSelectedReports(new Set());
        return true;
    };

    const handleShare = () => {

        const expiresAt = new Date();
        if (selectedTime.days === 0 && selectedTime.hours === 0 && selectedTime.minutes === 0) {
            expiresAt.setFullYear(expiresAt.getFullYear() + 100); // 100 years for "Unlimited"
        } else {
            expiresAt.setDate(expiresAt.getDate() + selectedTime.days);
            expiresAt.setHours(expiresAt.getHours() + selectedTime.hours);
            expiresAt.setMinutes(expiresAt.getMinutes() + selectedTime.minutes);
        }

        backend.shareMeasurement(currentPatient.id, {
            measurement_ids: Array.from(selectedReports),
            permission: 'view_only',
            doctorEmail: recipientEmail,
            expires_at: expiresAt
        }).then(() => {
            setRecipientEmail('');
            setSelectedReports(new Set());
            router.back();
            Snackbar.show({ text: 'Reports shared successfully', duration: Snackbar.LENGTH_SHORT, backgroundColor: theme.primarySoft, textColor: theme.primary });
        }).catch((error: any) => {
            Snackbar.show({ text: `Failed to share reports: ${error.message}`, duration: Snackbar.LENGTH_SHORT, backgroundColor: theme.danger, textColor: theme.text });
        });
    }

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBack
        );
        return () => backHandler.remove();
    }, [router]);

    const styles = stylesFunction(theme);

    return (
        <ThemedView style={[styles.root, { paddingTop: insets.top }]}>

            {/* ── Custom Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerIcon}>
                    <Ionicons name="arrow-down" size={22} color={theme.textGray} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Share</ThemedText>
                <Pressable style={[styles.headerIcon, { opacity: 0 }]}>
                    <Ionicons name="ellipsis-vertical" size={20} color={theme.textGray} />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Value & Unit ── */}
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.label}>REPORTS</Text>
                        {selectedReports.size > 0 && (
                            <ScalePressable
                                style={styles.selectedReportsCountContainer}
                                onPress={() => {
                                    setSelectedReports(new Set());
                                    Snackbar.show({ text: 'Cleared selected reports', duration: Snackbar.LENGTH_SHORT, backgroundColor: theme.primarySoft, textColor: theme.primary });
                                }}
                            >
                                <ThemedText style={styles.selectedReportsCount}>{selectedReports.size} Selected</ThemedText>

                                <FontAwesome5 name="times" color={theme.primary} size={13} style={{ marginTop: 1.3 }} />
                            </ScalePressable>
                        )}
                    </View>
                    <ScalePressable
                        style={[styles.iconBox, selectedReports.size === 0 && { backgroundColor: theme.primary }]}
                        collapsable={false}
                        onPress={() => router.navigate({ pathname: 'share/SelectReports' })}
                    >
                        <FontAwesome5
                            name="file-medical"
                            color={selectedReports.size > 0 ? theme.primary : '#FFFFFF'}
                            size={21}
                        />
                    </ScalePressable>
                </View>

                {/* ── Access Time ── */}
                <View>
                    <Text style={styles.label}>ACCESS TIME</Text>
                    <ScalePressable
                        style={styles.pickerBox}
                        onPress={() => setIsTimePickerVisible(true)}
                        activeOpacity={0.75}
                    >
                        <>
                            <ThemedText type={'h3'} style={{ color: theme.textGray, fontFamily: 'Lexend_400Regular' }}>
                                {selectedTime.days !== 0 ? selectedTime.days + 'D ' : ''}{selectedTime.hours !== 0 ? selectedTime.hours + 'H ' : ''}{selectedTime.minutes !== 0 ? selectedTime.minutes + 'M ' : ''}
                                {selectedTime.days === 0 && selectedTime.hours === 0 && selectedTime.minutes === 0 && 'Unlimited Access'}
                            </ThemedText>
                        </>
                        <Ionicons name="calendar-outline" size={18} color={theme.textGray} />
                    </ScalePressable>
                </View>

                <Text style={styles.label}>RECIPIENT EMAIL (Optional)</Text>
                <ThemedTextInput
                    placeholder="doctor@sehat.com"
                    style={{ width: '100%', borderRadius: 10 }}
                    value={recipientEmail}
                    onChangeText={setRecipientEmail}
                />

                <View style={{ height: 1, backgroundColor: theme.textGray, opacity: 0.3, borderRadius: 10, marginVertical: 20, marginHorizontal: 10 }} />

                {/* ── Share Button ── */}
                <ScalePressable
                    disabled={selectedReports.size === 0 || isShareLoading}
                    onPress={handleShare}
                    style={[styles.shareButton, selectedReports.size === 0 && { backgroundColor: theme.primarySoft }]}
                >
                    {isShareLoading ? (
                        <ActivityIndicator size="small" color={theme.text} style={{ padding: 2 }} />
                    ) : (
                        <Text style={[styles.saveBtnText, selectedReports.size > 0 && { color: '#FFFFFF' }]}>Share</Text>
                    )}
                </ScalePressable>

            </ScrollView>

            <CustomTimePickerModal
                initialValue={selectedTime}
                onCancel={() => setIsTimePickerVisible(false)}
                onConfirm={(pickedDuration) => {
                    setSelectedTime(pickedDuration);
                    setIsTimePickerVisible(false);
                }}
                setIsVisible={setIsTimePickerVisible}
                visible={isTimePickerVisible}
            />
        </ThemedView>
    );
}

const stylesFunction = (theme: typeof Colors.dark) => StyleSheet.create({
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
        height: 80,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.primarySoft,
        marginTop: 8,
    },
    /* ── Picker boxes (date / time) ── */
    pickerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.card,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 8,
    },

    saveBtnText: {
        fontSize: 16,
        fontFamily: 'Lexend_800ExtraBold',
        color: theme.textGray,
    },

    shareButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: theme.primary,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        paddingVertical: 18,
        marginTop: 10,
        gap: 7
    },

    selectedReportsCountContainer: {
        backgroundColor: theme.primarySoft,
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 13,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    selectedReportsCount: {
        color: theme.primary,
        fontFamily: 'PublicSans_600SemiBold',
    },
});