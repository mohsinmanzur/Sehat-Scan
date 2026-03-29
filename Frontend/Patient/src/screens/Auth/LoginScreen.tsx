import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useTheme } from '@context/ThemeContext';
import backend from 'src/services/Backend/backend.service';
import { Divider, Spacer, ThemedButton, ThemedText, ThemedTextInput, ThemedView } from 'src/components';
import { Ionicons } from '@expo/vector-icons';

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
        <ThemedView style = {{ flex: 1 }} keyboardAvoid>
            <ScrollView 
                style = {{ flex: 1, width: '100%' }}
                contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
            <Spacer height = {100} />
            <Text style = {{ padding: 20, paddingBottom: 0, alignItems: 'center', textAlign: 'center' }}>
                <ThemedText type = {'title'} style = {{ letterSpacing: -1 }}>Welcome to </ThemedText>
                <ThemedText type = {'title'} style = {{ color: theme.primary, letterSpacing: -1 }}>Sehat{'\u00A0'}Scan</ThemedText>
            </Text>

            <ThemedText type = {'default'} style = {[styles.tagline, { color: theme.textLight }]}>
                Medical documents management and AI-powered health insights, all in one app.
            </ThemedText>

            <Spacer height = {50} />

            <View style = {{ backgroundColor: theme.backgroundLight, borderRadius: 20, padding: 30, width: '90%' }}>
                <ThemedText type = {'default'} style = {{ color: theme.textGray, fontFamily: 'PublicSans_600SemiBold' }}>
                    Email or Phone Number
                </ThemedText>

                <ThemedTextInput style = {{
                    backgroundColor: theme.card,
                    borderColor: theme.card,
                    width: '100%',
                    borderWidth: 1,
                    borderRadius: 8,
                    marginTop: 8,
                    color: theme.textGray
                }}
                value={email}
                onChangeText={setEmail}
                placeholder = " name@example.com"
                placeholderTextColor={theme.textVeryLight}
                cursorColor={theme.primary}
                selectionColor={theme.primarySoft}
                keyboardType='email-address'
                autoCapitalize='none'
                />

                <ThemedButton
                    style = {styles.continueButton}
                    onPress={() => handlePress(email)}
                    >
                    <ThemedText style = {{ color: theme.backgroundLight, padding: 7, fontFamily: 'PublicSans_600SemiBold' }}>Continue</ThemedText>

                    <Ionicons name="arrow-forward" size={19} color={theme.backgroundLight} />
                </ThemedButton>

                <View style = {{ flexDirection: 'row', alignItems: 'center', marginTop: 15, justifyContent: 'center', gap: 10 }}>
                    <Divider width = '40%' height = {1} color = {theme.muted} />
                    <Text style = {{ fontSize: 13, fontFamily: 'PublicSans_600SemiBold', color: theme.muted }}>OR</Text>
                    <Divider width = '40%' height = {1} color = {theme.muted} />
                </View>

                <ThemedButton
                    style = {[styles.googleButton, { backgroundColor: theme.card }]}
                    >

                    <Ionicons name="logo-google" size={19} color={theme.textGray} />
                    <ThemedText style = {{ color: theme.textGray, padding: 7, fontFamily: 'PublicSans_600SemiBold' }}>Continue with Google</ThemedText>
                </ThemedButton>
            </View>

            <Text style = {{ textAlign: 'center', padding: 40, paddingTop: 50 }}>
                <ThemedText type = {'default'} style = {{ color: theme.textGray, fontSize: 12, paddingTop: 15 }}>
                    By continuing, you agree to our{' '}
                </ThemedText>
                <ThemedText type = {'default'} style = {{ color: theme.primary, fontSize: 12 }}>
                    Terms{'\u00A0'}of{'\u00A0'}Service
                </ThemedText>
                <ThemedText type = {'default'} style = {{ color: theme.textGray, fontSize: 12 }}>
                    {' '}and{' '}
                </ThemedText>
                <ThemedText type = {'default'} style = {{ color: theme.primary, fontSize: 12 }}>
                    Privacy{'\u00A0'}Policy
                </ThemedText>
                .
            </Text>
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
        flexDirection: 'row'
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
