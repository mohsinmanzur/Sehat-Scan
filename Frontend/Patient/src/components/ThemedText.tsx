import { Text, useColorScheme, TextProps, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '../constants/colors';

export interface FormatProps extends TextProps
{
  type?: 'default' | 'title' | 'subtitle' | 'h1' | 'h2' | 'h3' | 'error'
}

export const ThemedText = ({ type = 'default', style, ...props }: FormatProps) => {

  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const styles = StyleSheet.create({
    default: {
      color: theme.text,
      fontFamily: 'PublicSans_400Regular',
    },

    title: {
      color: theme.text,
      fontFamily: 'Lexend_700Bold',
      fontSize: 30,
    },
    subtitle: {
      color: theme.textLight,
      fontFamily: 'PublicSans_400Regular',
      fontSize: 15,
    },
    h1: {
      color: theme.text,
      fontFamily: 'Lexend_700Bold',
      fontSize: 25,
    },
    h2: {
      color: theme.text,
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 20,
    },
    h3: {
      color: theme.text,
      fontFamily: 'Lexend_600SemiBold',
      fontSize: 17,
    }
  })

  const selectedStyle = styles[type];

  return (
    <Text style = {[
        selectedStyle,
        style,
  ]} {...props} />
  )
}