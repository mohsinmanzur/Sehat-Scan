import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'src/context/ThemeContext';
import { ThemedView } from 'src/components';
import { ScalePressable } from 'src/components/ScalePressable';
import backend from 'src/services/Backend/backend.service';
import { HealthMeasurement } from '../../types/types';
import { GhostElement } from 'src/components/GhostElement';
import { useNetwork } from 'src/context/NetworkContext';
import { useDatabase } from 'src/context/DatabaseContext';
import { getDocumentById } from 'src/services/Database/documents.repository';
import { useCurrentPatient } from 'src/context/PatientContext';
import { useOfflineMutation } from 'src/hooks/useOfflineMutation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HealthMeasurementDetailScreen() {
    const { data, data2, primaryColor, secondaryColor, guestMode = "false" } = useLocalSearchParams<{ data: string, data2?: string, primaryColor: string, secondaryColor: string, guestMode: string }>();
    const router = useRouter();
    const { theme } = useTheme();
    const { isOnline } = useNetwork();
    const { db } = useDatabase();
    const { currentPatient } = useCurrentPatient();
    const { deleteMeasurement } = useOfflineMutation(currentPatient?.id);
    const insets = useSafeAreaInsets();

    const [secureUrl, setSecureUrl] = useState<string | null>(null);
    const [secureUrlLoading, setSecureUrlLoading] = useState(true);
    const [imageRatio, setImageRatio] = useState<number>(3 / 4);
    const isGuestMode = guestMode.toLowerCase() === "true";

    let measurement: HealthMeasurement | null = null;
    try {
        measurement = JSON.parse(data);
    } catch {
        // invalid params
    }

    useEffect(() => {
        if (!measurement) {
            setSecureUrlLoading(false);
            return;
        }
        const measurementId = measurement.id;
        const documentId = measurement.document_id;

        async function loadDocumentImage() {
            setSecureUrlLoading(true);
            try {
                // SQLite local file takes priority — works offline
                if (documentId && db) {
                    const doc = await getDocumentById(db, documentId);
                    if (doc?.local_file_path) {
                        setSecureUrl(doc.local_file_path);
                        Image.getSize(doc.local_file_path, (w, h) => {
                            if (w && h) setImageRatio(w / h);
                        }, () => {});
                        return;
                    }
                }

                // Fall back to backend only when online
                if (!isOnline) return;

                const res = await backend.getDocumentUrlfromMeasurementId(measurementId);
                if (res?.file_url) {
                    const response = await backend.getSecureDocumentUrl(res.file_url);
                    const url = response.file_url;
                    setSecureUrl(url);
                    if (url) {
                        Image.getSize(url, (w, h) => {
                            if (w && h) setImageRatio(w / h);
                        }, () => {});
                    }
                }
            } catch {
                // no image available — show nothing
            } finally {
                setSecureUrlLoading(false);
            }
        }

        loadDocumentImage();
    }, [measurement?.id, measurement?.document_id, db, isOnline]);

    if (!measurement) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.backgroundLight }]}>
                <Text style={{ color: theme.text }}>Measurement not found.</Text>
                <ScalePressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={{ color: theme.primary }}>Go Back</Text>
                </ScalePressable>
            </View>
        );
    }

    const handleDelete = async () => {
        await deleteMeasurement(measurement!.id!);
        router.back();
    }

    const handleEdit = () => {
        router.push({
            pathname: '/health_measurements/EditMeasurement',
            params: { data: JSON.stringify(measurement) }
        });
    }

    // Determine colors based on status
    let themeColor = primaryColor || theme.primary;
    let lightThemeColor = secondaryColor || theme.primarySoft;
    let icon = measurement.measurement_unit.unit_name === 'Weight' ? 'weight' : measurement.measurement_unit.unit_name === 'Blood Sugar' ? 'tint' : 'heartbeat';

    const dateObj = new Date(measurement.created_at);
    const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const displayValue = `${measurement.numeric_value} ${measurement.measurement_unit.symbol}`;

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.backgroundDark, paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]}>
                <View style={styles.headerTop}>
                    <ScalePressable onPress={() => router.back()} style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginLeft: -5 }}>
                        <Ionicons name="arrow-back" size={22} color={theme.textGray} />
                    </ScalePressable>
                </View>

                <View style={styles.heroContent}>
                    <View
                        style={[styles.iconBox, { backgroundColor: lightThemeColor }]}
                    >
                        <FontAwesome5 name={icon} size={40} color={themeColor} />
                    </View>

                    <Text style={[styles.heroTitle, { color: theme.text }]}>
                        {measurement.measurement_unit.measurement_group}
                    </Text>

                </View>

                <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, { color: theme.textGray, marginTop: 10 }]}>Measurement Value</Text>
                    <Text style={[styles.valueText, { color: theme.text }]}>
                        {measurement.numeric_value_2 != null 
                            ? `${measurement.numeric_value}/${measurement.numeric_value_2} ${measurement.measurement_unit.symbol}` 
                            : displayValue}
                    </Text>
                </View>

                <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, { color: theme.textGray }]}>Date Recorded</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{displayDate}</Text>
                </View>

                {secureUrlLoading && (
                    <View style={styles.imageContainer}>
                        <Text style={[styles.detailLabel, { color: theme.textGray, marginBottom: 8 }]}>Attached Document</Text>
                        <GhostElement style={[styles.attachedImage, { aspectRatio: imageRatio }]} />
                    </View>
                )}

                {secureUrl && !secureUrlLoading && (
                    <View style={styles.imageContainer}>
                        <Text style={[styles.detailLabel, { color: theme.textGray, marginBottom: 8 }]}>Attached Document</Text>
                        <Image
                            source={{ uri: secureUrl }}
                            style={[styles.attachedImage, { aspectRatio: imageRatio, backgroundColor: theme.backgroundLight }]}
                            resizeMode="contain"
                        />
                    </View>
                )}

                {!isGuestMode && (
                    <>
                        <ScalePressable
                            style={[styles.editBtn, { backgroundColor: theme.primary }]}
                            onPress={handleEdit}
                        >
                            <MaterialIcons name="edit" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.editBtnText}>Edit Entry</Text>
                        </ScalePressable>

                        <ScalePressable
                            onPress={handleDelete}
                            style={[styles.deleteBtn, { backgroundColor: theme.backgroundLight, borderWidth: 1, borderColor: theme.danger }]}
                        >
                            <MaterialIcons name="delete" size={20} color={theme.danger} style={{ marginRight: 8 }} />
                            <Text style={[styles.deleteBtnText, { color: theme.danger }]}>Delete Entry</Text>
                        </ScalePressable>
                    </>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        marginTop: 20,
        padding: 10,
    },
    heroHeader: {
        paddingTop: 60,
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    heroContent: {
        alignItems: 'center',
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '800',
    },
    scrollContent: {
        padding: 24,
        paddingTop: 14,
    },
    detailCard: {
        marginBottom: 24,
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    valueText: {
        fontSize: 32,
        fontWeight: '800',
    },
    detailValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    detailDescription: {
        fontSize: 16,
        lineHeight: 24,
    },
    editBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
        paddingVertical: 18,
        marginBottom: 16,
    },
    editBtnText: {
        fontSize: 16,
        fontFamily: 'Lexend_800ExtraBold',
        color: '#fff',
    },
    deleteBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
        paddingVertical: 18,
        marginBottom: 16,
    },
    deleteBtnText: {
        fontSize: 16,
        fontFamily: 'Lexend_800ExtraBold',
        color: '#fff',
    },
    imageContainer: {
        marginBottom: 24,
        width: '100%',
    },
    attachedImage: {
        width: '100%',
        borderRadius: 16,
        marginTop: 8
    }
});
