import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Report } from '../types/dto';
import { useTheme } from '@context/ThemeContext';

interface Props {
  report: Report;
}

const ReportCard: React.FC<Props> = ({ report }) => {

  const { theme } = useTheme();
  const isScanned = report.source === 'scanned';

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.type, { color: theme.muted }]}>{report.type}</Text>
      <Text style={[styles.title, { color: theme.text }]}>{report.title}</Text>
      <View style={styles.row}>
        <Text style={[styles.date, { color: theme.muted }]}>{report.date}</Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isScanned ? theme.primarySoft : theme.border
            }
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isScanned ? theme.primary : theme.muted }
            ]}
          >
            {isScanned ? 'Scanned via app' : 'Entered manually'}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.status,
          {
            color: report.status === 'processed' ? theme.primary : theme.muted
          }
        ]}
      >
        {report.status === 'processed' ? 'Processed' : 'Pending OCR'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10
  },
  type: {
    fontSize: 11,
    marginBottom: 2
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  date: {
    fontSize: 12
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999
  },
  badgeText: {
    fontSize: 11
  },
  status: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500'
  }
});

export default ReportCard;
