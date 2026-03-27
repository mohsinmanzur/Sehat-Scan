// src/screens/Auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useTheme } from '@context/ThemeContext';
import backend from 'src/services/Backend/backend.service';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const { theme } = useTheme();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePress = async (patientEmail: string) => {
        setLoading(true);
        try {
            await backend.requestcode(patientEmail);
            navigation.navigate('Otp', { patientEmail });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background, flex: 1, justifyContent: 'center' }]}>

            <View style={styles.safeTop} />

            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Login</Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>
                    Please enter your email.
                </Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    style={[
                        styles.input,
                        { borderColor: theme.border, color: theme.text },
                    ]}
                    placeholder="patient.email@example.com"
                    placeholderTextColor={theme.muted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <Pressable
                    style={[styles.button, { backgroundColor: theme.primary, }]}
                    onPress={() => handlePress(email)}
                >
                    {loading ? (
                        <ActivityIndicator color = "#fff"/>
                    ) : (
                        <Text style={styles.buttonLabel}>Continue</Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeTop: { height: 24 },
    safeBottom: { height: 24 },
    header: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    title: { fontSize: 24, fontWeight: '700' },
    subtitle: { fontSize: 13, marginTop: 4 },
    form: {
        paddingHorizontal: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        marginBottom: 8,
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
    listContainer: {
        flex: 1,
        paddingHorizontal: 16,
        marginTop: 10,
    },
    listLabel: { fontSize: 13, marginBottom: 4 },
    emailItem: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 6,
    },
});

export default LoginScreen;
