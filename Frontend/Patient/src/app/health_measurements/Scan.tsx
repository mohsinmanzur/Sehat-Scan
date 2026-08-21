import { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, ActivityIndicator, Pressable, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { ThemedButton, ThemedText, ThemedView } from "src/components";
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@context/ThemeContext';
import { Colors } from '@theme/colors';
import Svg, { Defs, Rect, Mask } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useGlobalContext } from '@context/GlobalContext';

export default function ScanDocument() {
    const [permission, requestPermission] = useCameraPermissions();
    const [isActive, setIsActive] = useState(false);
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const [isProcessing, setIsProcessing] = useState(false);
    const [zoom, setZoom] = useState(0);
    const cameraRef = useRef<CameraView>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const { setScannedImage } = useGlobalContext();

    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = styleSheet(theme, insets);

    useEffect(() => {
        if (isActive) {
            fadeAnim.setValue(1);
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 800,
                delay: 1000,
                useNativeDriver: true,
            }).start();
        }
    }, [isActive, fadeAnim]);

    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const pickFromGallery = useCallback(async () => {
        try {
            setIsProcessing(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
            });
            if (result.canceled || !result.assets?.[0]?.uri) {
                if (Platform.OS === 'web') router.back();
                return;
            }
            setScannedImage(result.assets[0].uri);
            router.back();
        } catch (error) {
            console.error('Error picking image from gallery:', error);
            if (Platform.OS === 'web') router.back();
        } finally {
            setIsProcessing(false);
        }
    }, [setScannedImage]);

    useFocusEffect(
        useCallback(() => {
            setIsActive(true);
            if (Platform.OS === 'web') {
                pickFromGallery();
            }
            return () => setIsActive(false);
        }, [pickFromGallery])
    );

    const takePicture = async () => {
        if (!cameraRef.current) return;
        try {
            setIsProcessing(true);
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
                shutterSound: false,
                
            });
            
            if (!photo) return;

            setScannedImage(photo.uri);
            router.back();
        }
        catch (error)
        {
            console.error('Error capturing or uploading photo:', error);
        }
        finally
        {
            setIsProcessing(false);
        }
    }

    const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
        // e.scale represents the pinch scale factor
        // We adjust it smoothly and constrain it between 0 and 1
        const velocity = e.scale - 1;
        let newZoom = zoom + velocity * 0.05; 
        
        newZoom = Math.max(0, Math.min(newZoom, 1)); // Clamp between 0 and 1
        setZoom(newZoom);
    })
    .runOnJS(true);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
                <ThemedText style={styles.message}>We need your permission to show the camera</ThemedText>
                <ThemedButton
                    style={{ alignSelf: 'center' }}
                    onPress={requestPermission}
                >
                    <ThemedText>Grant Permission</ThemedText>
                </ThemedButton>
                <ThemedButton
                    style={{ alignSelf: 'center', marginTop: 12 }}
                    onPress={pickFromGallery}
                >
                    <ThemedText>Choose from Gallery</ThemedText>
                </ThemedButton>
            </ThemedView>
        );
    }

    return (
    <GestureDetector gesture={pinchGesture}>
    <CameraView zoom={zoom} style={styles.camera} ref={cameraRef} facing={facing}>
                    
        {/* Dark Overlay with Transparent Rounded Cutout using SVG Mask */}
        <View style={StyleSheet.absoluteFill}>
            <Svg height="100%" width="100%">
                <Defs>
                    <Mask id="mask" x="0" y="0" height="100%" width="100%">
                        {/* White area represents the opacity mask */}
                        <Rect height="100%" width="100%" fill="#fff" />
                        {/* Black area punches a hole in the mask */}
                        <Rect
                            x="10%" // (100% - 80% width) / 2
                            y="12%" // (100% - 70% height) / 2
                            width="80%"
                            height="68%"
                            rx={30} // Rounded corners of the cutout
                            fill="#000"
                        />
                    </Mask>
                </Defs>
                <Rect
                    height="100%"
                    width="100%"
                    fill="rgba(0, 0, 0, 0.6)"
                    mask="url(#mask)"
                />
            </Svg>
        </View>

        {/* Corner Brackets / Viewfinder Overlay */}
        <View style={styles.overlayContainer}>

            <View style={styles.scanTarget}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <ThemedText style={styles.overlayText}>Align document here</ThemedText>
                </Animated.View>

                {/* Top Left Corner */}
                <View style={[styles.corner, styles.topLeft]} />
                {/* Top Right Corner */}
                <View style={[styles.corner, styles.topRight]} />
                {/* Bottom Left Corner */}
                <View style={[styles.corner, styles.bottomLeft]} />
                {/* Bottom Right Corner */}
                <View style={[styles.corner, styles.bottomRight]} />
            </View>
        </View>

        {/* Camera Controls / Shutter Button */}
        <View style={styles.bottomControls}>
            {/* Gallery Button */}
            <TouchableOpacity
                style={styles.iconButton}
                onPress={pickFromGallery}
                disabled={isProcessing}
            >
                <Ionicons name="images-outline" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Shutter Button */}
            <TouchableOpacity 
                style={[styles.shutterButtonOuter, isProcessing && { opacity: 0.5 }]} 
                activeOpacity={0.7}
                disabled={isProcessing}
                onPress={takePicture}
            >
                <View style={styles.shutterButtonInner} />
            </TouchableOpacity>

            {/* Flip Camera Button */}
            <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => {
                    setFacing(prev => prev === 'back' ? 'front' : 'back');
                }}
            >
                <Ionicons name="camera-reverse-outline" size={36} color="#FFFFFF" />
            </TouchableOpacity>
        </View>

        {isProcessing && (
            <View style={styles.processingMessageContainer}>
                <ActivityIndicator color={theme.primary} />
                <ThemedText>Processing photo...</ThemedText>
            </View>
        )}

        <Pressable onPress={router.back} style={({ pressed }) => [styles.crossButtomContainer, { opacity: pressed ? 0.5 : 1 }]}>
            <Ionicons name="close" size={32} color="#FFFFFF" />
        </Pressable>

    </CameraView>
    </GestureDetector>
    )
}

const styleSheet = (theme: typeof Colors.dark, insets: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.backgroundDark,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingMessageContainer: {
        position: 'absolute',
        backgroundColor: theme.card,
        alignSelf: 'center', // This perfectly centers the absolute element horizontally
        top: '15%',          // Adjust this to move it up or down
        padding: 16,
        paddingHorizontal: 30,
        borderRadius: 20,
        flexDirection: 'row',
        gap: 12,
    },
    crossButtomContainer: {
        position: 'absolute',
        top: insets.top + 9,
        left: 16,
    },
    message: {
        textAlign: 'center',
    },
    camera: {
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanTarget: {
        width: '80%',
        height: '68%',
        justifyContent: 'center',
        alignItems: 'center',
        top: '-4%',
    },
    overlayText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        zIndex: 10,
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#FFFFFF',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 30,
        borderColor: '#FFFFFF',
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 30,
        borderColor: '#FFFFFF',
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 30,
        borderColor: '#FFFFFF',
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 30,
        borderColor: '#FFFFFF',
    },
    bottomControls: {
        position: 'absolute',
        bottom: insets.bottom + 16,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        zIndex: 20,
    },
    iconButton: {
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterButtonOuter: {
        width: 70,
        height: 70,
        borderRadius: 38,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    shutterButtonInner: {
        width: 49,
        height: 49,
        borderRadius: 29,
        backgroundColor: '#FFFFFF',
    }
});