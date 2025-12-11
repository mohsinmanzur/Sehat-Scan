// src/screens/Settings/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useAppTheme } from '@theme/ThemeContext';
import { useCurrentPatient } from '@context/UserContext';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useAppTheme();
  const { currentPatient, setCurrentPatient } = useCurrentPatient();
  const navigation = useNavigation<any>();

  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    setCurrentPatient(null);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Landing' }],
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.safeTop} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Settings
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.muted }]}>
          Appearance
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Dark mode
          </Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.muted }]}>
          AI & notifications
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            AI-based insights
          </Text>
          <Switch
            value={aiInsightsEnabled}
            onValueChange={setAiInsightsEnabled}
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Report processed notifications
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.muted }]}>
          Account
        </Text>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {currentPatient?.name ?? 'No active patient'}
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 13 }}>
          {currentPatient?.email ?? 'Log in with a dummy account'}
        </Text>
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.colors.danger }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutLabel}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.safeBottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeTop: { height: 28 },
  safeBottom: { height: 28 },
  header: { paddingHorizontal: 16, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700' },

  section: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: { fontSize: 13, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: { fontSize: 15 },

  spacer: { flex: 1 },

  logoutButton: {
    marginHorizontal: 16,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default SettingsScreen;
