import React, { useState } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCurrentPatient } from "@context/PatientContext";
import { useTheme } from "@context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@theme/colors";
import { router } from "expo-router";
import {
    StyleSheet,
    View,
    Linking,
    Switch,
    Alert,
} from "react-native";
import { ThemedText } from "src/components";
import { ThemedView } from "src/components";
import { ScalePressable } from "src/components/ScalePressable";
import backend from "src/services/Backend/backend.service";
import { Snackbar } from "react-native-snackbar";
import { useDeviceOnlySetting } from "../../hooks/useDeviceOnlySetting";

const ProfileScreen: React.FC = () => {
    const { theme } = useTheme();
    const { currentPatient } = useCurrentPatient();
    const { isDeviceOnly, setIsDeviceOnly } = useDeviceOnlySetting(currentPatient?.id);
    const insets = useSafeAreaInsets();

    const styles = styleSheet(theme);

    const handleDeviceOnlyToggle = (value: boolean) => {
        /*
        if (value) {
            Alert.alert(
                'Enable Device-Only Mode',
                'Your data will no longer sync to the cloud. It will be stored on this device only.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Enable', onPress: () => setIsDeviceOnly(true) },
                ]
            );
        } else {
            Alert.alert(
                'Disable Device-Only Mode',
                'Your local data will be uploaded to the cloud. Are you sure?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sync to Cloud', onPress: () => setIsDeviceOnly(false) },
                ]
            );
        }
        */
       setIsDeviceOnly(value);
    };

    const handleLogout = async () => {
        await backend.logout();
        Snackbar.show({
            text: "Logged out successfully",
            duration: Snackbar.LENGTH_SHORT,
            backgroundColor: theme.primaryDark,
            textColor: "#FFFFFF",
        });
    };

    const firstName = currentPatient?.name?.split(" ")[0] ?? "User";
    const lastName = currentPatient?.name?.split(" ").slice(1).join(" ") ?? "";

    const menuItems = [
        {
            id: "profile",
            label: "User Profile",
            icon: <Ionicons name="person-circle-outline" size={22} color={theme.textLight} />,
            onPress: () => router.push("/profile/UserProfile"),
        },
        {
            id: "password",
            label: "Change Password",
            icon: <Ionicons name="lock-closed-outline" size={22} color={theme.textLight} />,
            onPress: () => router.push("/profile/ChangePassword"),
        },
        {
            id: "faq",
            label: "FAQs",
            icon: <Ionicons name="help-circle-outline" size={22} color={theme.textLight} />,
            onPress: () => router.push("/profile/FAQs"),
        },
    ];

    return (
        <ThemedView scroll style={{ paddingTop: insets.top }} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
            {/* Header */}
            <View style={styles.header}>
                <ScalePressable style={styles.backButton} onPress={router.back}>
                    <Ionicons name="arrow-back" color={theme.textGray} size={20} />
                </ScalePressable>
                <ThemedText type="h1" style={styles.headerTitle}>Settings</ThemedText>
            </View>

            {/* User Welcome Card */}
            <View style={styles.userCard}>
                <View style={styles.userInfo}>
                    <ThemedText style={styles.userName}>
                        {firstName} {lastName}
                    </ThemedText>
                    <ThemedText style={styles.welcomeLabel}>{currentPatient?.email}</ThemedText>
                </View>
                <ScalePressable style={styles.logoutIcon} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color={theme.primary} />
                </ScalePressable>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
                {menuItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <View style={{ backgroundColor: theme.textGray, opacity: 0.1, height: 1, borderRadius: 10 }} />
                        <ScalePressable onPress={item.onPress}>
                            <View
                                style={[
                                    styles.menuItem,
                                    index < menuItems.length - 1 && styles.menuItemBorder,
                                ]}
                            >
                                <View style={styles.menuItemLeft}>
                                    {item.icon}
                                    <ThemedText style={styles.menuItemLabel}>{item.label}</ThemedText>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color={theme.textVeryLight}
                                />
                            </View>
                        </ScalePressable>
                    </React.Fragment>
                ))}

                <View style={{ backgroundColor: theme.textGray, opacity: 0.1, height: 1, borderRadius: 10 }} />
            </View>

            {/* Device-Only Mode Toggle */}
            <View style={styles.menuSection}>
                <View style={{ backgroundColor: theme.textGray, opacity: 0.1, height: 1, borderRadius: 10 }} />
                <View style={[styles.menuItem]}>
                    <View style={styles.menuItemLeft}>
                        <Ionicons name="phone-portrait-outline" size={22} color={theme.textLight} />
                        <View>
                            <ThemedText style={styles.menuItemLabel}>Device-Only Mode</ThemedText>
                            <ThemedText style={{ fontSize: 11, color: theme.textLight, fontFamily: 'PublicSans_400Regular', marginTop: 1 }}>
                                Store data only on this device
                            </ThemedText>
                        </View>
                    </View>
                    <Switch
                        value={isDeviceOnly}
                        onValueChange={handleDeviceOnlyToggle}
                        trackColor={{ false: theme.backgroundDark, true: theme.primary }}
                        thumbColor={isDeviceOnly ? '#fff' : theme.textVeryLight}
                    />
                </View>
                <View style={{ backgroundColor: theme.textGray, opacity: 0.1, height: 1, borderRadius: 10 }} />
            </View>

            {/* WhatsApp Contact Card */}
            <View style={styles.contactCard}>
                <ThemedText style={styles.contactText}>
                    If you have any other query you{"\n"}can reach out to us.
                </ThemedText>
                <ScalePressable
                    onPress={() => Linking.openURL("https://wa.me/+923472689456")}
                >
                    <ThemedText style={styles.whatsappLink}>WhatsApp Us</ThemedText>
                </ScalePressable>
            </View>
        </ThemedView>
    );
};

export default ProfileScreen;

const styleSheet = (theme: typeof Colors.dark) =>
    StyleSheet.create({
        header: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 12,
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
            marginLeft: 14,
            fontSize: 28,
        },
        logoutIcon: {
            justifyContent: "center",
            alignItems: "center",
        },
        userCard: {
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 20,
            marginTop: 8,
            marginBottom: 5,
            borderRadius: 16,
            paddingVertical: 14,
            paddingHorizontal: 16,
        },
        avatarContainer: {
            marginRight: 14,
        },
        avatarPlaceholder: {
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: theme.primarySoft,
            justifyContent: "center",
            alignItems: "center",
        },
        userInfo: {
            flex: 1,
        },
        welcomeLabel: {
            fontSize: 12,
            color: theme.textLight,
            fontFamily: "PublicSans_400Regular",
            marginBottom: 2,
        },
        userName: {
            fontSize: 17,
            color: theme.primary,
            fontFamily: "PublicSans_600SemiBold",
        },
        menuSection: {
            marginHorizontal: 20,
            borderRadius: 16,
            paddingHorizontal: 4,
            marginBottom: 24,
        },
        menuItem: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 20,
            paddingHorizontal: 12,
        },
        menuItemBorder: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.backgroundDark,
        },
        menuItemLeft: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        },
        menuItemLabel: {
            fontSize: 15,
            color: theme.text,
            fontFamily: "PublicSans_500Medium",
        },
        contactCard: {
            marginHorizontal: 20,
            backgroundColor: theme.primarySoft,
            borderRadius: 16,
            paddingVertical: 20,
            paddingHorizontal: 20,
            alignItems: "center",
        },
        contactText: {
            textAlign: "center",
            fontSize: 14,
            color: theme.textLight,
            fontFamily: "PublicSans_400Regular",
            lineHeight: 20,
            marginBottom: 10,
        },
        whatsappLink: {
            fontSize: 14,
            color: theme.primary,
            fontFamily: "PublicSans_700Bold",
            textDecorationLine: "underline",
        },
    });