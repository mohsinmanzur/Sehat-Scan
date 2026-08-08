import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { setStatusBarStyle } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Colors } from '../constants/colors';
import { Platform } from 'react-native';

// Define the shape of the theme object
type Theme = typeof Colors.light;

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

  const currentMode = mode === 'system' ? systemScheme : mode;

  const theme = useMemo(() => {
    return currentMode === 'dark' ? Colors.dark : Colors.light;
  }, [currentMode]);

  useEffect(() => {
    setStatusBarStyle(currentMode === 'dark' ? 'light' : 'dark', true);
    
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync(currentMode === 'dark' ? 'light' : 'dark');
    }
  }, [currentMode, theme]);

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