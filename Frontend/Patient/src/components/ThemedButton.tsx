import { Pressable, PressableProps, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native'
import React from 'react'
import { Colors } from '../constants/colors'

interface ThemedButtonProps extends PressableProps
{
  isLoading?: boolean;
}

export const ThemedButton = ({ isLoading = false, style, children, ...props }: ThemedButtonProps) => {

  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button, { backgroundColor: theme.primary },
        pressed && styles.pressed,
        isLoading && styles.disabled,
        ...(Array.isArray(style) ? style : [typeof style === 'function' ? style({ pressed }) : style]),
      ]}
      disabled = {isLoading || props.disabled}
      {...props}
    >
      {isLoading ?
        <ActivityIndicator size = {"small"} color={theme.text} />
       : children}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 10
  },
  pressed: {
    opacity: 0.8
  },
  disabled: {
    opacity: 0.5
  }
})