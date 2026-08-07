import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from 'src/context/ThemeContext';
import { Spacer, ThemedButton, ThemedText, ThemedTextInput, ThemedView } from 'src/components';
import DatePicker from 'react-native-date-picker'
import { Ionicons } from '@expo/vector-icons';
import SwitchToggle from 'react-native-switch-toggle';
import Toast from 'react-native-toast-message';
import { useCurrentPatient } from '@context/PatientContext';
import { storeObject } from 'src/services/Storage/storage.service';
import backend from 'src/services/Backend/backend.service';
import { bloodGroups } from '../../types/others';
import { Dropdown } from 'src/components/common/Dropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const date = new Date();
date.setFullYear(date.getFullYear() - 1);

const SignupScreen: React.FC = () => {
    const params = useLocalSearchParams<{ patientEmail: string }>();
    const patientEmail = params.patientEmail;
    const router = useRouter();
    const { theme, setMode } = useTheme();
    const insets = useSafeAreaInsets();

    const { setCurrentPatient } = useCurrentPatient();

    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other'>(null);
    const [dateOfBirth, setDateOfBirth] = useState(date);
    const [bloodGroup, setBloodGroup] = useState('');
    const [betaOptIn, setBetaOptIn] = useState(false);

    const [nameError, setNameError] = useState(false);
    const [genderError, setGenderError] = useState(false);
    const [dobError, setDobError] = useState(false);
    const [bloodGroupError, setBloodGroupError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handlePress = async () => {

        if (!name.trim()) setNameError(true);
        if (dateOfBirth.toDateString() === date.toDateString()) setDobError(true);
        if (!gender) setGenderError(true);
        if (!bloodGroup.trim()) setBloodGroupError(true);

        if (!name.trim() || dateOfBirth.toDateString() === date.toDateString() || !gender || !bloodGroup.trim()) return;

        setIsLoading(true);

        try {
            const patientTokens = await backend.registerPatient({
                name: name,
                email: patientEmail,
                date_of_birth: dateOfBirth,
                blood_group: bloodGroup || null,
                is_research_opt_in: betaOptIn,
                gender: gender
            });

            const patient = await backend.getPatientById(patientTokens.id);

            setMode('dark');
            setCurrentPatient(patient);
            await storeObject('currentPatient', patient);

            router.replace('/(tabs)/Dashboard');
        }
        catch (error) {
            console.log('Signup error:', error.message);
            Toast.show({
                type: 'error',
                text1: 'Failed to create account',
                text2: error.message,
                position: 'bottom',
                visibilityTime: 3000,
            });
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemedView style={{ flex: 1, backgroundColor: theme.backgroundLight, paddingTop: insets.top }} keyboardAvoid>
            <ScrollView
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={{ paddingHorizontal: 30, paddingTop: 20, paddingBottom: 20 + insets.bottom }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <ThemedText type={'title'}>Let's start your health{'\u00A0'}journey.</ThemedText>
                <ThemedText type={'subtitle'} style={[styles.tagline, { color: theme.textGray }]}>We'll keep your data private and clinical.</ThemedText>

                <Spacer height={20} />

                <ThemedText type={'h2'}>🙍 What should we call you?</ThemedText>
                <ThemedTextInput
                    placeholder=" Enter your name"
                    value={name}
                    onChangeText={(text) => { setName(text); setNameError(false); }}
                    style={{ width: '100%', paddingVertical: 16, marginTop: 10, borderColor: nameError ? theme.danger : theme.card, borderWidth: 1, borderRadius: 10 }}
                />

                {/* Gender Selection */}
                <ThemedText type={'h2'} style={{ marginTop: 30 }}>⚧️ Gender</ThemedText>
                <View style={{ flexDirection: 'row', gap: 15, marginTop: 10 }}>
                    <Pressable
                        onPress={() => { setGender('male'); setGenderError(false); }}
                        style={(pressed) => ({
                            flex: 1,
                            padding: 15,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: genderError ? theme.danger : gender === 'male' ? theme.primary : theme.card,
                            backgroundColor: gender === 'male' ? theme.primarySoft : theme.card,
                            alignItems: 'center',
                            opacity: pressed ? 0.7 : 1
                        })}
                    >
                        <Ionicons name="male" size={28} color={gender === 'male' ? theme.primary : theme.textGray} />
                        <ThemedText style={{ marginTop: 8, color: gender === 'male' ? theme.primary : theme.textGray, fontFamily: 'PublicSans_600SemiBold' }}>Male</ThemedText>
                    </Pressable>

                    <Pressable
                        onPress={() => { setGender('female'); setGenderError(false); }}
                        style={(pressed) => ({
                            flex: 1,
                            padding: 15,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: genderError ? theme.danger : gender === 'female' ? theme.primary : theme.card,
                            backgroundColor: gender === 'female' ? theme.primarySoft : theme.card,
                            alignItems: 'center',
                            opacity: pressed ? 0.7 : 1
                        })}
                    >
                        <Ionicons name="female" size={28} color={gender === 'female' ? theme.primary : theme.textGray} />
                        <ThemedText style={{ marginTop: 8, color: gender === 'female' ? theme.primary : theme.textGray, fontFamily: 'PublicSans_600SemiBold' }}>Female</ThemedText>
                    </Pressable>

                    <Pressable
                        onPress={() => { setGender('other'); setGenderError(false); }}
                        style={(pressed) => ({
                            flex: 1,
                            padding: 15,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: genderError ? theme.danger : gender === 'other' ? theme.primary : theme.card,
                            backgroundColor: gender === 'other' ? theme.primarySoft : theme.card,
                            alignItems: 'center',
                            opacity: pressed ? 0.7 : 1
                        })}
                    >
                        <Ionicons name="male-female" size={28} color={gender === 'other' ? theme.primary : theme.textGray} />
                        <ThemedText style={{ marginTop: 8, color: gender === 'other' ? theme.primary : theme.textGray, fontFamily: 'PublicSans_600SemiBold' }}>Other</ThemedText>
                    </Pressable>
                </View>

                <ThemedText type={'h2'} style={{ marginTop: 30 }}>🗓️ Date of Birth</ThemedText>
                <DatePicker
                    mode='date'
                    date={dateOfBirth}
                    onDateChange={(date) => { setDateOfBirth(date); setDobError(false); }}
                    maximumDate={new Date()}
                    locale={'en-GB'}
                    dividerColor={dobError ? theme.danger : theme.text}
                    theme={'light'}
                />

                <ThemedText type={'h2'} style={{ marginTop: 20 }}>🩸 Blood Group</ThemedText>

                <Dropdown
                    options={bloodGroups.map(item => (item.value))}
                    value={bloodGroup}
                    onChange={(value) => { setBloodGroup(value); setBloodGroupError(false); }}
                    remainingStyles={{ marginTop: 20 }}
                    error={bloodGroupError}
                />
                <View style={{ backgroundColor: theme.card, padding: 30, borderRadius: 30, marginVertical: 50 }}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Ionicons name='flask-sharp' size={17} color={'#9A3200'} />
                        <ThemedText style={{ fontFamily: 'PublicSans_800ExtraBold', fontSize: 12, color: '#9A3200' }}>BETA PROGRAM</ThemedText>
                    </View>

                    <ThemedText type={'h2'} style={{ marginTop: 8 }}>Join Research </ThemedText>
                    <ThemedText style={{ color: theme.textLight, fontSize: 14, lineHeight: 20, marginTop: 8 }}>
                        Contribute your health scans to global medical research. Your identity stays 100% private.
                    </ThemedText>

                    <SwitchToggle
                        switchOn={betaOptIn}
                        onPress={() => setBetaOptIn(prev => !prev)}
                        circleColorOff={theme.backgroundLight}
                        circleColorOn={theme.primary}
                        backgroundColorOn={theme.primarySoft}
                        backgroundColorOff={theme.primarySoft}
                        duration={200}
                        containerStyle={{
                            width: 50,
                            height: 26,
                            borderRadius: 15,
                            padding: 4,
                            marginTop: 15,
                        }}
                        circleStyle={{
                            width: 19,
                            height: 19,
                            borderRadius: 10,
                        }}
                    />
                </View>

                <ThemedButton
                    style={[styles.continueButton, { backgroundColor: isLoading ? theme.primaryDark : theme.primary, shadowColor: theme.primary }]}
                    onPress={handlePress}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={theme.backgroundLight} style={{ padding: 9.5 }} />
                    ) : (
                        <>
                            <ThemedText style={{ color: theme.backgroundLight, padding: 7, fontFamily: 'PublicSans_800ExtraBold', fontSize: 18 }}>Create my Health Profile</ThemedText>
                            <Ionicons name="arrow-forward" size={19} color={theme.backgroundLight} />
                        </>
                    )}
                </ThemedButton>

                <Text style={{ textAlign: 'center', paddingHorizontal: 20, paddingVertical: 15 }}>
                    <ThemedText type={'default'} style={{ color: theme.textGray, fontSize: 12 }}>
                        By joining, you agree to our{' '}
                    </ThemedText>
                    <ThemedText type={'default'} style={{ color: theme.primary, fontSize: 12 }}>
                        Terms{'\u00A0'}of{'\u00A0'}Service
                    </ThemedText>
                    <ThemedText type={'default'} style={{ color: theme.textGray, fontSize: 12 }}>
                        {' '}and{' '}
                    </ThemedText>
                    <ThemedText type={'default'} style={{ color: theme.primary, fontSize: 12 }}>
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
        marginBottom: 20,
        fontSize: 18,
        paddingRight: 20,
        paddingTop: 10,
        fontFamily: 'PublicSans_600SemiBold'
    },
    continueButton: {
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        flexDirection: 'row',
        // iOS Shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, // Keeps the shadow soft
        shadowRadius: 6,

        // Android Shadow (shadowColor tint requires Android 9+)
        elevation: 6,
    },
});

export default SignupScreen;
