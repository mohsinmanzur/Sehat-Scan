// src/screens/Auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useAppTheme } from '@theme/ThemeContext';
import { patients } from '@mock/patients';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const { theme } = useAppTheme();
    const [email, setEmail] = useState('');
    const [filtered, setFiltered] = useState(patients.slice(0, 10));

    const onChange = (text: string) => {
        setEmail(text);
        const lower = text.toLowerCase();
        const list = patients
            .filter((p) => p.email.toLowerCase().includes(lower))
            .slice(0, 10);
        setFiltered(list);
    };

    const goToOtp = (patientId: string) => {
        navigation.navigate('Otp', { patientId });
    };

    const handleContinue = () => {
        const p = patients.find((pt) => pt.email === email.trim());
        if (p) goToOtp(p.id);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.safeTop} />

            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Login</Text>
                <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
                    Choose any dummy patient email to load 1–2 years of reports.
                </Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    style={[
                        styles.input,
                        { borderColor: theme.colors.border, color: theme.colors.text },
                    ]}
                    placeholder="patient.email@example.com"
                    placeholderTextColor={theme.colors.muted}
                    value={email}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={handleContinue}
                >
                    <Text style={styles.buttonLabel}>Continue</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
                <Text style={[styles.listLabel, { color: theme.colors.muted }]}>
                    Example dummy emails
                </Text>
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.emailItem,
                                { borderColor: theme.colors.border },
                            ]}
                            onPress={() => goToOtp(item.id)}
                        >
                            <Text style={{ color: theme.colors.text, fontSize: 14 }}>
                                {item.email}
                            </Text>
                            <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                                {item.condition.toUpperCase()} • {item.yearsOfData} yr data
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.safeBottom} />
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
