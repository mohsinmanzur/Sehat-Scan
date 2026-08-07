import { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { ThemedButton, ThemedText, ThemedView } from "src/components";
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@context/ThemeContext';
import { Colors } from '@theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Snackbar } from 'react-native-snackbar';
import { ScalePressable } from 'src/components/ScalePressable';
import backend from 'src/services/Backend/backend.service';

export default function ScanQR() {
    const { shareId } = useLocalSearchParams<{ shareId: string }>();
    const [permission, requestPermission] = useCameraPermissions();
    const [isActive, setIsActive] = useState(false);
    const [hasScanned, setHasScanned] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    const [qrBounds, setQrBounds] = useState<BarcodeScanningResult['bounds'] | null>(null);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const successAnim = useRef(new Animated.Value(0)).current;

    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = styleSheet(theme, insets);

    useEffect(() => {
        if (isActive) {
            fadeAnim.setValue(1);
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 800,
                delay: 2000,
                useNativeDriver: true,
            }).start();
        }
    }, [isActive, fadeAnim]);

    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    useFocusEffect(
        useCallback(() => {
            setIsActive(true);
            setHasScanned(false);
            setQrBounds(null);
            return () => setIsActive(false);
        }, [])
    );

    const handleBarCodeScanned = async ({ bounds, data }: BarcodeScanningResult) => {
        if (bounds) {
            setQrBounds(bounds);
        }

        if (hasScanned) return;
        setHasScanned(true);

        Animated.sequence([
            Animated.timing(successAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(successAnim, { toValue: 0, duration: 400, delay: 600, useNativeDriver: true }),
        ]).start();

        // data is the raw decoded QR string — used as the receiverUuid
        const receiverUuid = data?.trim();

        if (!receiverUuid || !shareId) {
            Snackbar.show({
                text: 'Invalid QR code or missing share context.',
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: theme.danger,
                textColor: '#FFFFFF',
            });
            setHasScanned(false);
            return;
        }

        try {
            await backend.handleWebhook(receiverUuid, shareId);
            Snackbar.show({
                text: `Access Granted!`,
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: theme.primarySoft,
                textColor: theme.primary,
            });
            setTimeout(() => { router.back(); }, 800);
        } catch (error: any) {
            Snackbar.show({
                text: `Failed to send share: ${error.message}`,
                duration: Snackbar.LENGTH_LONG,
                backgroundColor: theme.danger,
                textColor: '#FFFFFF',
            });
            setHasScanned(false);
        }
    };

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <ThemedText style={styles.message}>We need your permission to use the camera</ThemedText>
                <ThemedButton
                    style={{ alignSelf: 'center' }}
                    onPress={requestPermission}
                >
                    <ThemedText>Grant Permission</ThemedText>
                </ThemedButton>
            </ThemedView>
        );
    }

    return (
        <CameraView
            style={styles.camera}
            facing="back"
            enableTorch={torchOn}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarCodeScanned}
        >
            {/* Dynamic QR Bounding Box Overlay */}
            {qrBounds && (
                <View
                    style={[
                        styles.dynamicBoundingBox,
                        {
                            left: qrBounds.origin.x,
                            top: qrBounds.origin.y,
                            width: qrBounds.size.width,
                            height: qrBounds.size.height,
                        }
                    ]}
                >
                    <Animated.View style={[StyleSheet.absoluteFillObject, styles.successFlash, { opacity: successAnim }]} />
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>
            )}

            <View style={styles.overlayContainer}>
                <Animated.View style={{ opacity: fadeAnim, marginTop: 'auto', marginBottom: 120 }}>
                    <ThemedText style={styles.hintText}>Point your camera at a QR code</ThemedText>
                </Animated.View>
            </View>

            <ScalePressable onPress={router.back} style={styles.crossButton}>
                <Ionicons name="close" size={32} color="#FFFFFF" />
            </ScalePressable>

            <ScalePressable style={styles.torchButton} onPress={() => setTorchOn(prev => !prev)}>
                <Ionicons
                    name={torchOn ? 'flash' : 'flash-outline'}
                    size={26}
                    color={torchOn ? theme.primary : '#FFFFFF'}
                />
            </ScalePressable>

            <View style={styles.topLabel}>
                <ThemedText style={styles.topLabelText}>Scan QR Code</ThemedText>
            </View>

            {hasScanned && (
                <View style={styles.rescanContainer}>
                    <TouchableOpacity
                        style={[styles.rescanButton, { backgroundColor: theme.primary }]}
                        onPress={() => {
                            setHasScanned(false);
                            setQrBounds(null);
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                        <ThemedText style={styles.rescanText}>Scan Again</ThemedText>
                    </TouchableOpacity>
                </View>
            )}
        </CameraView>
    );
}

const styleSheet = (theme: typeof Colors.dark, insets: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.backgroundDark,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 30,
    },
    camera: {
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 1,
    },
    dynamicBoundingBox: {
        position: 'absolute',
        zIndex: 2,
        borderRadius: 12,
    },
    successFlash: {
        borderRadius: 12,
        backgroundColor: 'rgba(0, 230, 118, 0.4)',
    },
    corner: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderColor: theme.primary,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 12,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 12,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 12,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 12,
    },
    hintText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        opacity: 0.85,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    crossButton: {
        position: 'absolute',
        top: insets.top + 9,
        left: 16,
        zIndex: 10,
    },
    torchButton: {
        position: 'absolute',
        top: insets.top + 9,
        right: 16,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    topLabel: {
        position: 'absolute',
        top: insets.top + 12,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9,
    },
    topLabelText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    rescanContainer: {
        position: 'absolute',
        bottom: insets.bottom + 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    rescanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 30,
    },
    rescanText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});