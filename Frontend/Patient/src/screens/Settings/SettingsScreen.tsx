// src/screens/Settings/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useCurrentPatient } from '@context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@context/ThemeContext';

const SettingsScreen: React.FC = () => {
  const { currentPatient, setCurrentPatient } = useCurrentPatient();
  const { theme, mode, setMode } = useTheme();
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
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.safeTop} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Settings
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.muted }]}>
          Appearance
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>
            Dark mode
          </Text>
          <Switch value={mode === 'dark'} onValueChange={() => {setMode(mode === 'dark' ? 'light' : 'dark')}} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.muted }]}>
          AI & notifications
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>
            AI-based insights
          </Text>
          <Switch
            value={aiInsightsEnabled}
            onValueChange={setAiInsightsEnabled}
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>
            Report processed notifications
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.muted }]}>
          Account
        </Text>
        <Text style={[styles.label, { color: theme.text }]}>
          {currentPatient?.name ?? 'No active patient'}
        </Text>
        <Text style={{ color: theme.muted, fontSize: 13 }}>
          {currentPatient?.email ?? 'Log in with a dummy account'}
        </Text>
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.danger }]}
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
