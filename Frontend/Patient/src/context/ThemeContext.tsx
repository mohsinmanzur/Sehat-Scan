import React, { createContext, useState, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from '../constants/colors';

// Define the shape of the theme object
type Theme = typeof colors.light;

interface ThemeContextData {
  theme: Theme;
  mode: 'light' | 'dark' | 'system';
  setMode: (mode: 'light' | 'dark' | 'system') => void;
  themeJson: string; // <-- Add the new property for the JSON string
}

export const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>('system');

  const theme = useMemo(() => {
    const currentMode = mode === 'system' ? systemScheme : mode;
    return currentMode === 'dark' ? colors.dark : colors.light;
  }, [mode, systemScheme]);

  // Create a memoized JSON string of the current theme
  const themeJson = useMemo(() => JSON.stringify(theme, null, 2), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, themeJson }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};