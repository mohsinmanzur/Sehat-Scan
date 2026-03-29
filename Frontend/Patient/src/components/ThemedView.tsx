import { useColorScheme, View, ViewProps, KeyboardAvoidingView, Platform } from 'react-native'
import React from 'react'
import { Colors } from '../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface SafeViewProps extends ViewProps {
  safe?: boolean;
  keyboardAvoid?: boolean;
}

export const ThemedView = ({ safe = false, keyboardAvoid = false, style, ...props }: SafeViewProps) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  
  const insets = useSafeAreaInsets();

  const Component = keyboardAvoid ? KeyboardAvoidingView : View;
  const keyboardProps = keyboardAvoid 
    ? {
      behavior: Platform.OS === 'ios' ? 'padding' as const : 'height' as const,
      keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 12,
    } 
    : {};

  return (
    <Component 
      style={[
        { 
          backgroundColor: theme.backgroundDark,
          flex: 1 
        },
        safe && {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right
        },
        style
      ]} 
      {...keyboardProps}
      {...props} 
    />
  )
}