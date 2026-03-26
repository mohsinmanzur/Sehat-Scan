// src/screens/Auth/LandingScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useTheme } from '@context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

const LandingScreen: React.FC<Props> = ({ navigation }) => {

    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.safeTop} />

            <View style={styles.center}>
                <Text style={[styles.title, { color: theme.text }]}>SehatScan</Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>
                    Swipe up to see your health, securely.
                </Text>
            </View>

            <View style={styles.bottomArea}>
                <Text style={{ color: theme.muted, fontSize: 13, marginBottom: 8 }}>
                    Swipe up or tap to log in
                </Text>
                <TouchableOpacity
                    style={[styles.swipeHandle, { borderColor: theme.border }]}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={{ color: theme.text, fontSize: 14 }}>Swipe up</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.safeBottom} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeTop: { height: 32 },
    safeBottom: { height: 24 },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
    },
    bottomArea: {
        alignItems: 'center',
        marginBottom: 32,
    },
    swipeHandle: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 26,
        paddingVertical: 12,
    },
});

export default LandingScreen;
