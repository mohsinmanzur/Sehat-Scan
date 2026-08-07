import React, { useState } from "react";
import { useTheme } from "@context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@theme/colors";
import { router } from "expo-router";
import {
    Pressable,
    StyleSheet,
    View,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { ThemedText, ThemedView } from "src/components";
import { ScalePressable } from "src/components/ScalePressable";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChangePasswordScreen: React.FC = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const styles = styleSheet(theme);

    const handleSave = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert("Validation", "Please fill in both fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Validation", "Passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            Alert.alert("Validation", "Password must be at least 8 characters.");
            return;
        }

        setIsSaving(true);
        try {
            // TODO: wire up actual password change API
            await new Promise((res) => setTimeout(res, 800));
            Toast.show({
                type: "success",
                text1: "Password changed",
                text2: "Your password has been updated.",
            });
            setNewPassword("");
            setConfirmPassword("");
            router.back();
        } catch {
            Toast.show({ type: "error", text1: "Failed to change password." });
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
                        <ThemedText style={styles.headerTitle}>Change Password</ThemedText>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Card */}
                    <View style={styles.card}>

                        {/* New Password */}
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="New Password"
                                placeholderTextColor={theme.textVeryLight}
                                secureTextEntry={!showNew}
                                autoCapitalize="none"
                            />
                            <Pressable
                                onPress={() => setShowNew((v) => !v)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showNew ? "eye-outline" : "eye-off-outline"}
                                    size={18}
                                    color={theme.textVeryLight}
                                />
                            </Pressable>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm Password"
                                placeholderTextColor={theme.textVeryLight}
                                secureTextEntry={!showConfirm}
                                autoCapitalize="none"
                            />
                            <Pressable
                                onPress={() => setShowConfirm((v) => !v)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showConfirm ? "eye-outline" : "eye-off-outline"}
                                    size={18}
                                    color={theme.textVeryLight}
                                />
                            </Pressable>
                        </View>

                        {/* Save */}
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
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
};

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
        card: {
            marginHorizontal: 20,
            marginTop: 20,
            borderRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 28,
        },
        cardTitle: {
            fontSize: 22,
            fontFamily: "Lexend_700Bold",
            color: theme.primary,
            marginBottom: 24,
            textAlign: "center",
        },
        inputWrapper: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.card,
            borderRadius: 12,
            marginBottom: 16,
            paddingRight: 12,
        },
        input: {
            flex: 1,
            color: theme.text,
            fontFamily: "PublicSans_400Regular",
            fontSize: 15,
            paddingHorizontal: 16,
            paddingVertical: 14,
        },
        eyeIcon: {
            padding: 4,
        },
        saveButton: {
            marginTop: 8,
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

export default ChangePasswordScreen;
