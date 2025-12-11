// src/theme/ThemeContext.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

type ThemeColors = {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  muted: string;
  danger: string;
  warning: string;
  success: string;
};

type AppTheme = {
  dark: boolean;
  colors: ThemeColors;
};

const lightTheme: AppTheme = {
  dark: false,
  colors: {
    primary: '#3b82f6',
    background: '#f9fafb',
    card: '#ffffff',
    text: '#020617',
    border: '#e5e7eb',
    muted: '#6b7280',
    danger: '#dc2626',
    warning: '#eab308',
    success: '#16a34a',
  },
};

const darkTheme: AppTheme = {
  dark: true,
  colors: {
    primary: '#38bdf8',
    background: '#020617',
    card: '#0b1120',
    text: '#e5e7eb',
    border: '#1f2937',
    muted: '#9ca3af',
    danger: '#f97373',
    warning: '#facc15',
    success: '#22c55e',
  },
};

type ThemeContextValue = {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

  const isDark = overrideDark ?? (systemScheme === 'dark');

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      toggleTheme: () =>
        setOverrideDark((prev) => (prev === null ? !isDark : !prev)),
    }),
    [isDark]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }
  return ctx;
};
