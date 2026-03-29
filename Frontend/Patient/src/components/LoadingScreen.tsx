import { ActivityIndicator, useColorScheme, StyleSheet } from 'react-native'
import React from 'react'
import { ThemedView } from './ThemedView';
import { Colors } from '../constants/colors';

const LoadingScreen = () => {
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];
    return (
        <ThemedView style={ { ...StyleSheet.absoluteFillObject, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.backgroundDark }}>
            <ActivityIndicator size="large" color={theme.primary} />
        </ThemedView>
    )
}

export default LoadingScreen