import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '@theme/ThemeContext';

const modes: { label: string; value: 'light' | 'dark' | 'system' }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' }
];

const ThemeToggle: React.FC = () => {
  const { theme, mode, setMode } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>Theme</Text>
      <View style={styles.row}>
        {modes.map(m => (
          <TouchableOpacity
            key={m.value}
            onPress={() => setMode(m.value)}
            style={[
              styles.button,
              {
                backgroundColor:
                  mode === m.value ? theme.colors.primarySoft : theme.colors.background,
                borderColor: mode === m.value ? theme.colors.primary : theme.colors.border
              }
            ]}
          >
            <Text
              style={{
                color: mode === m.value ? theme.colors.primary : theme.colors.muted,
                fontSize: 13
              }}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6
  },
  row: {
    flexDirection: 'row',
    gap: 8
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 6
  }
});

export default ThemeToggle;
