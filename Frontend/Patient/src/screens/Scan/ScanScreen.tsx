// src/screens/Scan/ScanScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { BottomTabParamList } from '@navigation/BottomTabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@context/ThemeContext';

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Scan'>,
  NativeStackScreenProps<RootStackParamList>
>;

const ScanScreen: React.FC<Props> = ({ navigation }) => {
    const [sheetVisible, setSheetVisible] = useState(false);

    const openSheet = () => setSheetVisible(true);
    const closeSheet = () => setSheetVisible(false);

    const { theme } = useTheme();

    const askForCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Camera permission needed',
                'Please enable camera permission in settings to scan reports.'
            );
            return false;
        }
        return true;
    };

    const askForGalleryPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Photos permission needed',
                'Please enable photo library permission in settings to upload reports.'
            );
            return false;
        }
        return true;
    };

    const handleScanReport = async () => {
        closeSheet();

        const ok = await askForCameraPermission();
        if (!ok) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
            });

            if (!result.canceled) {
                Alert.alert(
                    'Scan complete (dummy)',
                    'Camera opened and a picture was taken. In a real app this would be processed into a report.'
                );
            }
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'Something went wrong while opening the camera.');
        }
    };

    const handleUploadReport = async () => {
        closeSheet();

        const ok = await askForGalleryPermission();
        if (!ok) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
            });

            if (!result.canceled) {
                Alert.alert(
                    'Upload complete (dummy)',
                    'Gallery opened and an image was chosen. In a real app this would be attached to a report.'
                );
            }
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'Something went wrong while opening the gallery.');
        }
    };

    const handleInputManually = () => {
        closeSheet();
        Alert.alert(
            'Manual input (dummy)',
            'Here you could show a form for entering values manually.'
        );
    };

    const handleReviewReports = () => {
        closeSheet();
        // adjust "Reports" to whatever route name you use for the reports screen
        navigation.navigate('Reports');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.safeTop} />

            <Text style={[styles.title, { color: theme.text }]}>Scan reports</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
                Scan new reports, upload existing ones or enter values manually.
            </Text>

            <TouchableOpacity
                style={[styles.bigButton, { backgroundColor: theme.primary }]}
                onPress={openSheet}
                activeOpacity={0.85}
            >
                <Ionicons name="camera-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.bigButtonText}>Scan / upload / review</Text>
            </TouchableOpacity>

            <View style={styles.infoRow}>
                <Ionicons name="information-circle-outline" size={18} color={theme.muted} />
                <Text style={[styles.infoText, { color: theme.muted }]}>
                    All reports are listed with AI insights under "Review reports".
                </Text>
            </View>

            <View style={styles.safeBottom} />

            {/* Bottom sheet */}
            <Modal
                visible={sheetVisible}
                transparent
                animationType="slide"
                onRequestClose={closeSheet}
            >
                <Pressable style={styles.backdrop} onPress={closeSheet} />

                <View style={[styles.sheet, { backgroundColor: theme.card }]}>
                    <View style={styles.sheetHandle} />

                    <Text style={[styles.sheetTitle, { color: theme.text }]}>
                        What would you like to do?
                    </Text>

                    <SheetItem
                        icon="camera-outline"
                        label="Scan report"
                        description="Open camera and scan a physical report."
                        onPress={handleScanReport}
                        colors={theme}
                    />
                    <SheetItem
                        icon="image-outline"
                        label="Upload report"
                        description="Pick a report photo from your gallery."
                        onPress={handleUploadReport}
                        colors={theme}
                    />
                    <SheetItem
                        icon="create-outline"
                        label="Input manually"
                        description="Enter values when a scan is not possible."
                        onPress={handleInputManually}
                        colors={theme}
                    />
                    <SheetItem
                        icon="document-text-outline"
                        label="Review reports"
                        description="See history, AI insights and graphs."
                        onPress={handleReviewReports}
                        colors={theme}
                    />

                    <TouchableOpacity onPress={closeSheet} style={styles.closeButton}>
                        <Text style={{ color: theme.muted, fontSize: 15 }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

type SheetItemProps = {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    description: string;
    onPress: () => void;
    colors: any;
};

const SheetItem: React.FC<SheetItemProps> = ({
    icon,
    label,
    description,
    onPress,
    colors,
}) => (
    <TouchableOpacity style={styles.sheetItem} onPress={onPress} activeOpacity={0.85}>
        <View
            style={[
                styles.sheetIconBox,
                { backgroundColor: colors.primary + '22' }, // light tint
            ]}
        >
            <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={[styles.sheetItemLabel, { color: colors.text }]}>{label}</Text>
            <Text style={[styles.sheetItemDesc, { color: colors.muted }]}>{description}</Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    safeTop: { height: 32 },
    safeBottom: { height: 24 },
    title: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
    },
    bigButton: {
        marginTop: 8,
        borderRadius: 999,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bigButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginRight: 20,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 13,
        flex: 1,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 26,
    },
    sheetHandle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginVertical: 8,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 4,
    },
    sheetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    sheetIconBox: {
        width: 42,
        height: 42,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sheetItemLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    sheetItemDesc: {
        fontSize: 13,
    },
    closeButton: {
        alignSelf: 'center',
        marginTop: 12,
    },
});

export default ScanScreen;
