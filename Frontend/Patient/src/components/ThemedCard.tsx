import { View, useColorScheme, ViewProps, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '../constants/colors';

export const ThemedCard = ({ style, ...props }: ViewProps) => {
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];
  return (
    <View style = {[{
        backgroundColor: theme.card,
        ...styles.card
    },
    style]} {...props} />
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 7,
    padding: 15
  }
})