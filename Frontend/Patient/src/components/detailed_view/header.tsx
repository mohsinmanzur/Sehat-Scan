import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScalePressable } from 'src/components/ScalePressable';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@context/ThemeContext';
import { ThemedText } from 'src/components';

export function Header({ title }: { title: string }) {
    const { theme } = useTheme();

    return (
        <View style={[styles.header, { backgroundColor: 'transparent' }]}>
            <ScalePressable onPress={() => router.back()} style={styles.headerIcon}>
                <Ionicons name="arrow-back" size={22} color={theme.textGray} />
            </ScalePressable>
            <ThemedText style={[styles.headerTitle, { color: theme.textGray }]}>{title}</ThemedText>
            <Ionicons name="ellipsis-vertical" size={20} color={theme.textGray} style={{ opacity: 0 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    headerIcon: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});
