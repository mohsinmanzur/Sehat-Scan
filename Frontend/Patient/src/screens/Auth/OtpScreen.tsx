// src/screens/Auth/OtpScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { patients } from '@mock/patients';
import { useCurrentPatient } from '@context/UserContext';
import { useTheme } from '@context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const OtpScreen: React.FC<Props> = ({ route, navigation }) => {
    const { setCurrentPatient } = useCurrentPatient();
    const [otp, setOtp] = useState('');

    const { patientId } = route.params;
    const patient = patients.find((p) => p.id === patientId);
    const { theme } = useTheme();

    const handleVerify = () => {
        // Dummy OTP – accept anything
        if (patient) {
            setCurrentPatient(patient);
            navigation.replace('MainTabs');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.safeTop} />

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>
                    Verify OTP
                </Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>
                    Enter any 6 digits to continue for {patient?.email}.
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

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    onPress={handleVerify}
                >
                    <Text style={styles.buttonLabel}>Continue</Text>
                </TouchableOpacity>
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
