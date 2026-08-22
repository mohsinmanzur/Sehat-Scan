import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { ScalePressable } from 'src/components/ScalePressable';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'src/context/ThemeContext';

export const SearchBar: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
        <Ionicons name="search" size={20} color={theme.textLight} style={styles.icon} />
        <TextInput
          placeholder="Search documents..."
          placeholderTextColor={theme.textLight}
          style={[styles.input, { color: theme.text }]}
        />
      </View>
      <ScalePressable style={[styles.filterButton, { backgroundColor: theme.card }]}>
        <Ionicons name="options-outline" size={24} color={theme.textGray} />
      </ScalePressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginRight: 16,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
