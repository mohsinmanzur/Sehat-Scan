// src/screens/Scan/ScanSheet.tsx
import React, { FC } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { useCurrentPatient } from '@context/UserContext';
import { useTheme } from '@context/ThemeContext';

interface Props {
    visible: boolean;
    onClose: () => void;
    onShowReports: () => void;
}

const ScanSheet: FC<Props> = ({ visible, onClose, onShowReports }) => {
    const { currentPatient } = useCurrentPatient();
    const navigation = useNavigation<any>();
    const { theme } = useTheme();

    if (!visible) return null;

    const createPendingReport = async (uri?: string, source: 'scanned' | 'manual' = 'scanned') => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);

        let ocrText: string | undefined;
        if (uri) {
            // ocrText = await runOcrOnImage(uri);
        }

        const newReport: Report = {
            id: `pending-${now.getTime()}`,
            patientId: currentPatient?.id ?? 'p-unknown',
            title: 'Scanned report',
            date: dateStr,
            type: 'other',
            risk: 'normal',
            source,
            values: [60, 65, 70, 75, 80, 82, 85, 90],
            imageUri: uri,
            //ocrText,
        };

        // Navigate to Reports screen and pass this new report
        navigation.navigate('Reports', { newReport });
        onClose();
    };

    const ensureCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Camera permission required', 'Please allow camera access to scan reports.');
            return false;
        }
        return true;
    };

    const ensureMediaPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Gallery permission required', 'Please allow photo access to upload reports.');
            return false;
        }
        return true;
    };

    const handleScanCamera = async () => {
        const ok = await ensureCameraPermission();
        if (!ok) return;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.length) {
            const uri = result.assets[0].uri;
            await createPendingReport(uri, 'scanned');
        }
    };

    const handleUploadGallery = async () => {
        const ok = await ensureMediaPermission();
        if (!ok) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.length) {
            const uri = result.assets[0].uri;
            await createPendingReport(uri, 'scanned');
        }
    };

    const handleManual = async () => {
        // For now manual is also added as a pending "Scanned report" but without image.
        await createPendingReport(undefined, 'manual');
    };

    const handleReviewReports = () => {
        onClose();
        onShowReports();
    };

    return (
        <View style={styles.backdrop}>
            <View
                style={[
                    styles.sheet,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                    },
                ]}
            >
                <View style={styles.handle} />

                <Text style={[styles.title, { color: theme.text }]}>
                    Scan & manage reports
                </Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>
                    Use your camera or gallery, or add values manually.
                </Text>

                <View style={styles.options}>
                    <TouchableOpacity
                        style={[styles.optionButton, { backgroundColor: theme.primary + '22' }]}
                        onPress={handleScanCamera}
                    >
                        <Ionicons
                            name={Platform.OS === 'ios' ? 'camera' : 'camera-outline'}
                            size={22}
                            color={theme.primary}
                        />
                        <Text style={[styles.optionText, { color: theme.text }]}>
                            Scan with camera
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionButton, { backgroundColor: theme.card }]}
                        onPress={handleUploadGallery}
                    >
                        <Ionicons
                            name="image-outline"
                            size={22}
                            color={theme.text}
                        />
                        <Text style={[styles.optionText, { color: theme.text }]}>
                            Upload from gallery
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionButton, { backgroundColor: theme.card }]}
                        onPress={handleManual}
                    >
                        <MaterialIcons
                            name="edit-note"
                            size={22}
                            color={theme.text}
                        />
                        <Text style={[styles.optionText, { color: theme.text }]}>
                            Input manually
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionButton, { backgroundColor: theme.card }]}
                        onPress={handleReviewReports}
                    >
                        <Ionicons
                            name="list-outline"
                            size={22}
                            color={theme.text}
                        />
                        <Text style={[styles.optionText, { color: theme.text }]}>
                            Review reports
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Text style={{ color: theme.muted, fontSize: 13 }}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#00000055',
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderWidth: 1,
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 20,
        minHeight: '55%',
    },
    handle: {
        width: 46,
        height: 4,
        borderRadius: 999,
        backgroundColor: '#6b7280',
        alignSelf: 'center',
        marginVertical: 6,
    },
    title: { fontSize: 18, fontWeight: '700', marginTop: 4 },
    subtitle: { fontSize: 13, marginTop: 4 },

    options: { marginTop: 14, rowGap: 8 },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 14,
    },
    optionText: { fontSize: 14, marginLeft: 10 },

    closeBtn: {
        alignSelf: 'center',
        marginTop: 10,
    },
});

export default ScanSheet;
