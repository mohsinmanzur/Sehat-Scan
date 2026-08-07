import React, { useState } from "react";
import { useTheme } from "@context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@theme/colors";
import { router } from "expo-router";
import {
    Pressable,
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    LayoutAnimation,
} from "react-native";
import { ThemedText, ThemedView } from "src/components";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const faqs = [
    {
        q: "How do I add a health measurement?",
        a: "Go to the Home tab and tap the '+' button. Select the measurement type, enter the value, and confirm. Your data is stored securely.",
    },
    {
        q: "How do I share my records with a doctor?",
        a: 'Navigate to the Shares tab and tap "New Share". Enter the doctor\'s email, select measurements to share, set permissions and an expiry date, then confirm.',
    },
    {
        q: "Is my health data encrypted?",
        a: "Yes. All your health data is encrypted in transit and at rest. We use industry-standard AES-256 encryption to ensure your privacy.",
    },
    {
        q: "How do I revoke access from a doctor?",
        a: 'Open the Shares tab, find the share you want to revoke, and tap "Revoke Access". The doctor will immediately lose access to your records.',
    },
    {
        q: "Can I update my profile information?",
        a: "Yes. Go to Settings → User Profile. You can update your name, email, and phone number there.",
    },
    {
        q: "What happens when an access grant expires?",
        a: "When the expiry date is reached, the doctor's access is automatically revoked. You can also revoke it manually before expiry.",
    },
];

const FAQsScreen: React.FC = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const styles = styleSheet(theme);

    const toggle = (i: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex((prev) => (prev === i ? null : i));
    };

    return (
        <ThemedView style={{ paddingTop: insets.top }}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={router.back}>
                        <Ionicons name="arrow-back" color={theme.textGray} size={20} />
                    </Pressable>
                    <ThemedText style={styles.headerTitle}>FAQs</ThemedText>
                    <View style={styles.headerSpacer} />
                </View>

                <ThemedText style={styles.subtitle}>
                    Frequently asked questions
                </ThemedText>

                <View style={styles.faqList}>
                    {faqs.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            activeOpacity={0.8}
                            onPress={() => toggle(i)}
                            style={[
                                styles.faqItem,
                                i < faqs.length - 1 && styles.faqItemBorder,
                            ]}
                        >
                            <View style={styles.faqQuestion}>
                                <ThemedText style={styles.questionText}>{item.q}</ThemedText>
                                <Ionicons
                                    name={expandedIndex === i ? "chevron-up" : "chevron-down"}
                                    size={16}
                                    color={theme.textVeryLight}
                                />
                            </View>
                            {expandedIndex === i && (
                                <ThemedText style={styles.answerText}>{item.a}</ThemedText>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
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
        subtitle: {
            fontSize: 13,
            color: theme.textLight,
            fontFamily: "PublicSans_400Regular",
            marginHorizontal: 24,
            marginTop: 4,
            marginBottom: 20,
        },
        faqList: {
            marginHorizontal: 20,
            backgroundColor: theme.card,
            borderRadius: 16,
            paddingHorizontal: 8,
        },
        faqItem: {
            paddingVertical: 16,
            paddingHorizontal: 12,
        },
        faqItemBorder: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.backgroundDark,
        },
        faqQuestion: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        questionText: {
            flex: 1,
            fontSize: 15,
            color: theme.text,
            fontFamily: "PublicSans_500Medium",
            paddingRight: 8,
        },
        answerText: {
            marginTop: 10,
            fontSize: 14,
            color: theme.textLight,
            fontFamily: "PublicSans_400Regular",
            lineHeight: 20,
        },
    });

export default FAQsScreen;
