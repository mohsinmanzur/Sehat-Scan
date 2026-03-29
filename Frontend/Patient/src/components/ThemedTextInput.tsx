import { StyleSheet, TextInput, TextInputProps, useColorScheme } from 'react-native'
import React from 'react'
import { Colors } from '../constants/colors';

export const ThemedTextInput = ({ style, ...props }: TextInputProps) => {

  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
    <TextInput
    placeholderTextColor={theme.textLight}
        style = {[{
            backgroundColor: theme.backgroundLight,
            color: theme.text,
            borderRadius: 6,
            paddingHorizontal: 15,
            paddingVertical: 12,
            width: '80%'
        },
        style]}
        {...props}
    />
  )
}

const styles = StyleSheet.create({})