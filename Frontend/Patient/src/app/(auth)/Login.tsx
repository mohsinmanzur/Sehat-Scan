import React, { useRef, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import backend from '../../services/Backend/backend.service';
import { Divider, Spacer, ThemedButton, ThemedLogo, ThemedText, ThemedTextInput, ThemedView } from '../../components';
import { Ionicons } from '@expo/vector-icons';
import { errorShakeAnimation } from '../../animations/animations';
import { phoneRegex, emailRegex } from '../../constants/regex';
import { useRouter } from 'expo-router';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { useCurrentPatient } from '@context/PatientContext';
import { storeObject } from '../../services/Storage/storage.service';
import { handleError } from 'src/utils/errorHandler';

GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });

const LoginScreen: React.FC = () => {
    const router = useRouter();
    const { theme, mode } = useTheme();
    const { setCurrentPatient } = useCurrentPatient();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showError, setShowError] = useState(false);

    const shakeAnimation = useRef(new Animated.Value(0)).current;

    const colorMode = mode === 'system' ? useColorScheme() : mode;

    const handlePress = async () => {
        if (!emailRegex.test(email.trim()) && !phoneRegex.test(email.trim())) {
            setShowError(true);
            errorShakeAnimation(shakeAnimation);
            return;
        }
        setShowError(false);

        setIsLoading(true);
        try {
            await backend.requestcode(email);
            router.push({ pathname: '/Otp', params: { patientEmail: email } });
        }
        catch (error) {
            handleError(error);
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();

            if (!isSuccessResponse(response)) return;

            const { idToken, user } = response.data;
            if (!idToken) throw new Error('No ID token returned from Google');

            const authResponse = await backend.googleAuth(idToken);

            if (authResponse.needsRegistration) {
                router.replace({ pathname: '/Signup', params: { patientEmail: user.email, patientName: user.name ?? '' } });
                return;
            }

            const patient = await backend.getPatientByEmail(user.email);
            setCurrentPatient(patient);
            await storeObject('currentPatient', patient);
        }
        catch (error: any) {
            handleError(error, {
                userMessage: `Google sign-in failed: ${error.message}`,
                backgroundColor: theme.danger,
            });
        }
        finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <ThemedView style={{ flex: 1, backgroundColor: theme.backgroundDark }} keyboardAvoid>
            <ScrollView
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Spacer height={100} />

                <ThemedLogo style={{ height: 90, resizeMode: "contain" }} />

                <ThemedText style={{ fontSize: 13, color: theme.text, fontFamily: 'Lexend_300Light', marginTop: 15 }}>
                    SAVE
                    <ThemedText style={{ fontSize: 15, color: theme.primary }}>  •  </ThemedText>
                    UPLOAD
                    <ThemedText style={{ fontSize: 15, color: theme.primary }}>  •  </ThemedText>
                    SHARE
                </ThemedText>

                <Spacer height={50} />

                <View style={{ backgroundColor: theme.backgroundLight, borderRadius: 20, padding: 30, width: '90%', elevation: 5, shadowColor: theme.shadow }}>
                    <ThemedText type={'default'} style={{ color: theme.textGray, fontFamily: 'PublicSans_600SemiBold' }}>
                        Email or Phone Number
                    </ThemedText>

                    <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
                        <ThemedTextInput style={{
                            backgroundColor: theme.card,
                            borderColor: showError ? theme.danger : theme.card,
                            width: '100%',
                            borderWidth: 1,
                            borderRadius: 8,
                            marginTop: 8,
                            color: theme.textGray
                        }}
                            value={email}
                            onChangeText={(text) => { setEmail(text); setShowError(false); }}
                            placeholder=" name@example.com"
                            placeholderTextColor={theme.textVeryLight}
                            cursorColor={theme.primary}
                            selectionColor={theme.primarySoft}
                            keyboardType='email-address'
                            autoCapitalize='none'
                        />
                    </Animated.View>

                    <ThemedButton
                        style={[styles.continueButton, { backgroundColor: isLoading ? theme.primaryDark : theme.primary, shadowColor: theme.primary }]}
                        onPress={handlePress}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={theme.backgroundLight} style={{ padding: 6.5 }} />
                        ) : (
                            <>
                                <ThemedText style={{ color: theme.backgroundLight, padding: 7, fontFamily: 'PublicSans_600SemiBold' }}>Continue</ThemedText>
                                <Ionicons name="arrow-forward" size={19} color={theme.backgroundLight} />
                            </>
                        )}
                    </ThemedButton>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, justifyContent: 'center', gap: 10 }}>
                        <Divider width='40%' height={1} color={theme.muted} />
                        <Text style={{ fontSize: 13, fontFamily: 'PublicSans_600SemiBold', color: theme.muted }}>OR</Text>
                        <Divider width='40%' height={1} color={theme.muted} />
                    </View>

                    <ThemedButton
                        style={[styles.googleButton, { backgroundColor: theme.card }]}
                        onPress={handleGoogleSignIn}
                        disabled={isLoading || isGoogleLoading}
                    >
                        {isGoogleLoading ? (
                            <ActivityIndicator color={theme.textGray} style={{ padding: 6.5 }} />
                        ) : (
                            <>
                                <Ionicons name="logo-google" size={19} color={theme.textGray} />
                                <ThemedText style={{ color: theme.textGray, padding: 7, fontFamily: 'PublicSans_600SemiBold' }}>Continue with Google</ThemedText>
                            </>
                        )}
                    </ThemedButton>
                </View>
            </ScrollView>
        </ThemedView>
    )
};

const styles = StyleSheet.create({
    tagline: {
        paddingTop: 10,
        paddingHorizontal: 30,
        lineHeight: 20,
        alignContent:
            'center', textAlign:
            'center'
    },
    continueButton: {
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        marginTop: 20,
        flexDirection: 'row',
        // iOS Shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, // Keeps the shadow soft
        shadowRadius: 6,

        // Android Shadow (shadowColor tint requires Android 9+)
        elevation: 6,
    },
    googleButton: {
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        marginTop: 20,
        flexDirection: 'row'
    }
});

export default LoginScreen;
