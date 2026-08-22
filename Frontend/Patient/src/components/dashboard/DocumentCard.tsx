import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScalePressable } from 'src/components/ScalePressable';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'src/context/ThemeContext';

export type StatusTag = 'Requires Review' | 'Elevated' | 'Normal' | 'Completed';

interface DocumentCardProps {
  title: string;
  type: string;
  status: StatusTag;
  dateStr: string;
  iconName: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ title, type, status, dateStr, iconName }) => {
  const { theme } = useTheme();

  // Determine colors based on status
  let themeColor = theme.primary;
  let lightThemeColor = theme.primarySoft;

  switch (status) {
    case 'Requires Review':
      themeColor = theme.danger;
      lightThemeColor = theme.dangerLight;
      break;
    case 'Elevated':
      themeColor = theme.warning;
      lightThemeColor = theme.warningLight;
      break;
    case 'Normal':
    case 'Completed':
      themeColor = theme.success;
      lightThemeColor = theme.successLight;
      break;
  }

  return (
    <ScalePressable style={[styles.cardContainer, { backgroundColor: theme.card === '#20201F' ? '#2A2A29' : '#FFFFFF' }]}>
      {/* Colored left border indicator */}
      <View style={[styles.leftBorderIndicator, { backgroundColor: themeColor }]} />

      <View style={styles.cardContent}>
        {/* Leading Icon Box */}
        <View style={[styles.iconBox, { backgroundColor: lightThemeColor }]}>
          <FontAwesome5 name={iconName} size={20} color={themeColor} />
        </View>

        {/* Title and Badge Columns */}
        <View style={styles.textColumn}>
          <View style={styles.headerRow}>
            <Text style={[styles.titleText, { color: theme.text }]} numberOfLines={1}>{title}</Text>
          </View>

          <View style={styles.tagsRow}>
            <View style={[styles.typeBadgeContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.typeBadgeText, { color: theme.textGray }]}>{type}</Text>
            </View>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color={theme.textLight} />
              <Text style={[styles.dateText, { color: theme.textLight }]}>{dateStr}</Text>
            </View>
          </View>
        </View>
        
        {/* Right Status Badge and Chevron */}
        <View style={styles.rightColumn}>
          <View style={[styles.statusBadge, { backgroundColor: lightThemeColor }]}>
            <Text style={[styles.statusText, { color: themeColor }]}>{status}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textLight} style={styles.chevron} />
        </View>
      </View>
    </ScalePressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    height: 96,
  },
  leftBorderIndicator: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    paddingRight: 10,
    alignItems: 'center',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    marginRight: 6,
  },
});
