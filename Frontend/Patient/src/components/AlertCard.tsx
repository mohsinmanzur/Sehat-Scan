import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Alert } from '../types/models';
import { useTheme } from '../context/ThemeContext';

interface Props {
  alert: Alert;
}

const AlertCard: React.FC<Props> = ({ alert }) => {
  const { theme } = useTheme();

  const severityColor =
    alert.severity === 'high'
      ? theme.danger
      : alert.severity === 'medium'
      ? theme.primary
      : theme.muted;

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: severityColor }]}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: severityColor + '22' }]}>
          <Text style={[styles.badgeText, { color: severityColor }]}>
            {alert.severity.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.date, { color: theme.muted }]}>{alert.date}</Text>
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{alert.title}</Text>
      <Text style={[styles.desc, { color: theme.muted }]}>{alert.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center'
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600'
  },
  date: {
    fontSize: 11
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4
  },
  desc: {
    fontSize: 13,
    lineHeight: 18
  }
});

export default AlertCard;
