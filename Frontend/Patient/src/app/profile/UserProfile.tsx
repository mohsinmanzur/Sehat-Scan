import React, { useState } from "react";
import { useCurrentPatient } from "@context/PatientContext";
import { useTheme } from "@context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@theme/colors";
import { router } from "expo-router";
import {
    Pressable,
    StyleSheet,
    View,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Spacer, ThemedText, ThemedView } from "src/components";
import { ScalePressable } from "src/components/ScalePressable";
import { Snackbar } from "react-native-snackbar";
import { handleError } from "src/utils/errorHandler";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const UserProfileScreen: React.FC = () => {
    const { theme } = useTheme();
    const { currentPatient } = useCurrentPatient();
    const insets = useSafeAreaInsets();

    const fullName = currentPatient?.name ?? "";
    const nameParts = fullName.split(" ");
    const [firstName, setFirstName] = useState(nameParts[0] ?? "");
    const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");
    const [email, setEmail] = useState(currentPatient?.email ?? "");
    const [phone, setPhone] = useState(currentPatient?.phone ?? "");
    const [isSaving, setIsSaving] = useState(false);

    const styles = styleSheet(theme);

    const handleSave = async () => {
        if (!firstName.trim()) {
            Alert.alert("Validation", "First name cannot be empty.");
            return;
        }
        setIsSaving(true);
        try {
            // TODO: wire up actual update API
            await new Promise((res) => setTimeout(res, 800)); // simulate API
            Snackbar.show({
                text: 'Profile updated: Your changes have been saved.',
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: theme.success,
                textColor: '#FFFFFF',
            });
        } catch (error) {
            handleError(error, {
                userMessage: 'Failed to save changes.',
                backgroundColor: theme.danger,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ThemedView style={{ paddingTop: insets.top }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 16}
            >
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable style={styles.backButton} onPress={router.back}>
                            <Ionicons name="arrow-back" color={theme.textGray} size={20} />
                        </Pressable>
                        <ThemedText style={styles.headerTitle}>User Profile</ThemedText>
                        <View style={styles.headerSpacer} />
                    </View>

                    <Spacer height={15} />

                    {/* Form */}
                    <View style={styles.form}>
                        <FormField
                            label="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="First Name"
                            theme={theme}
                        />
                        <FormField
                            label="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Last Name"
                            theme={theme}
                        />
                        <FormField
                            label="E-Mail"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email Address"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            theme={theme}
                        />
                        <FormField
                            label="Mobile"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+92-3001234567"
                            keyboardType="phone-pad"
                            theme={theme}
                        />
                    </View>

                    {/* Save Button */}
                    <ScalePressable
                        style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <ThemedText style={styles.saveButtonText}>SAVE</ThemedText>
                        )}
                    </ScalePressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
};

interface FormFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: any;
    autoCapitalize?: any;
    theme: typeof Colors.dark;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    autoCapitalize = "words",
    theme,
}) => {
    const fieldStyles = formFieldStyles(theme);
    return (
        <View style={fieldStyles.container}>
            <ThemedText style={fieldStyles.label}>{label}</ThemedText>
            <TextInput
                style={fieldStyles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.textVeryLight}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
            />
        </View>
    );
};

const formFieldStyles = (theme: typeof Colors.dark) =>
    StyleSheet.create({
        container: {
            marginBottom: 16,
        },
        label: {
            fontSize: 12,
            color: theme.textLight,
            fontFamily: "PublicSans_400Regular",
            marginBottom: 6,
        },
        input: {
            backgroundColor: theme.card,
            color: theme.text,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontFamily: "PublicSans_400Regular",
            fontSize: 15,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.backgroundDark,
        },
    });

const styleSheet = (theme: typeof Colors.dark) =>
    StyleSheet.create({
        scrollContent: {
            flexGrow: 1,
            paddingBottom: 40,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 8,
        },
        backButton: {
            height: 38,
            width: 38,
            borderRadius: 100,
            justifyContent: "center",
            alignItems: "center",
        },
        headerTitle: {
            flex: 1,
            textAlign: "center",
            fontSize: 18,
            fontFamily: "PublicSans_600SemiBold",
            color: theme.text,
        },
        headerSpacer: {
            width: 38,
        },
        avatarSection: {
            alignItems: "center",
            marginTop: 24,
            marginBottom: 32,
        },
        avatarRing: {
            width: 96,
            height: 96,
            borderRadius: 48,
            borderWidth: 3,
            borderColor: theme.primarySoft,
            justifyContent: "center",
            alignItems: "center",
        },
        avatarPlaceholder: {
            width: 84,
            height: 84,
            borderRadius: 42,
            backgroundColor: theme.primarySoft,
            justifyContent: "center",
            alignItems: "center",
        },
        form: {
            paddingHorizontal: 24,
        },
        saveButton: {
            marginHorizontal: 24,
            marginTop: 24,
            backgroundColor: theme.primaryDark,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
        },
        saveButtonText: {
            color: "#FFFFFF",
            fontFamily: "PublicSans_700Bold",
            fontSize: 15,
            letterSpacing: 1.2,
        },
    });

export default UserProfileScreen;
