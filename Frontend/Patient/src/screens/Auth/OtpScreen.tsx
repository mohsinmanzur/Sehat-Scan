import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useCurrentPatient } from '@context/UserContext';
import { useTheme } from '@context/ThemeContext';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import backend from 'src/services/Backend/backend.service';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const OtpScreen: React.FC<Props> = ({ route, navigation }) => {
    const { setCurrentPatient } = useCurrentPatient();
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { patientEmail } = route.params;
    const { theme } = useTheme();

    const handleVerify = async () => {

        setIsLoading(true);
        let verifyresponse;

        try
        {
            verifyresponse = await backend.verifycode(patientEmail, otp);
        }
        catch (error)
        {
            Toast.show({
                type: 'error',
                text1: 'Verification failed',
                text2: error.message,
                position: 'bottom',
                visibilityTime: 3000,
            });
            setIsLoading(false);
            return;
        }

        if (verifyresponse.needsRegistration)
        {
            Toast.show({
                type: 'info',
                text1: 'No account found',
                text2: 'Redirecting to registration...',
                position: 'bottom',
                visibilityTime: 3000
            })
            setIsLoading(false);
            return;
        }

        const patient = await backend.getPatientByEmail(patientEmail);
        setCurrentPatient(patient);
        navigation.replace('MainTabs');

        setIsLoading(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            <View style={styles.safeTop} />

            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ borderColor: theme.border, paddingTop: 10, paddingLeft: 10 }}
            >
                <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>
                    Verify OTP
                </Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>
                    Enter any 6 digits to continue for {patientEmail}.
                </Text>

                <TextInput
                    style={[
                        styles.input,
                        { borderColor: theme.border, color: theme.text },
                    ]}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="000000"
                    placeholderTextColor={theme.muted}
                    keyboardType="numeric"
                    maxLength={6}
                />

                <Pressable
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    onPress={handleVerify}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.buttonLabel}>Continue</Text>
                    )}
                </Pressable>
            </View>

            <View style={styles.safeBottom} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeTop: { height: 24 },
    safeBottom: { height: 24 },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    title: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
    subtitle: { fontSize: 13, marginBottom: 14 },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 18,
        textAlign: 'center',
        letterSpacing: 5,
        marginBottom: 12,
    },
    button: {
        borderRadius: 999,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonLabel: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default OtpScreen;
