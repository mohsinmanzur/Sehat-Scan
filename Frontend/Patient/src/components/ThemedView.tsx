import { View, KeyboardAvoidingView, Platform, ScrollView, ScrollViewProps } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'src/context/ThemeContext';

export interface SafeViewProps extends ScrollViewProps {
  safe?: boolean;
  keyboardAvoid?: boolean;
  scroll?: boolean;
}

export const ThemedView = ({ safe = false, keyboardAvoid = false, scroll = false, style, ...props }: SafeViewProps) => {

  const { theme } = useTheme();

  const insets = useSafeAreaInsets();

  const Component: React.ElementType = scroll ? ScrollView : (keyboardAvoid ? KeyboardAvoidingView : View);
  const keyboardProps = keyboardAvoid && !scroll
    ? {
      behavior: 'padding' as const,
      keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 12,
    }
    : {};

  return (
    <Component
      style={[
        {
          backgroundColor: theme.backgroundDark,
          flex: 1,
          width: '100%',
        },
        safe && {
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right
        },
        style
      ]}
      {...keyboardProps}
      {...(props as any)}
    />
  )
}