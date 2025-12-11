// src/screens/Dashboard/DashboardScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@theme/ThemeContext';
import { useCurrentPatient } from '@context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type RiskLevel = 'normal' | 'borderline' | 'high';

const DashboardScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const { currentPatient } = useCurrentPatient();
  const navigation = useNavigation<any>();

  const bp = currentPatient?.bpSummary;
  const sugar = currentPatient?.sugarSummary;
  const heart = currentPatient?.heartSummary;

  const anyDanger =
    (bp && bp.riskLevel === 'high') ||
    (sugar && sugar.riskLevel === 'high') ||
    (heart && heart.riskLevel === 'high');

  const getStatusColors = (risk: RiskLevel) => {
    if (risk === 'normal')
      return {
        border: theme.colors.success + '80',
        bg: theme.colors.success + '18',
      };
    if (risk === 'borderline')
      return {
        border: theme.colors.warning + '99',
        bg: theme.colors.warning + '20',
      };
    return {
      border: theme.colors.danger + 'aa',
      bg: theme.colors.danger + '20',
    };
  };

  const renderStatusIcon = (risk: RiskLevel) => {
    if (risk === 'normal') {
      return (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={theme.colors.success}
        />
      );
    }
    if (risk === 'borderline') {
      return (
        <MaterialIcons
          name="error-outline"
          size={24}
          color={theme.colors.warning}
        />
      );
    }
    return (
      <MaterialIcons
        name="warning"
        size={24}
        color={theme.colors.danger}
      />
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* safe top */}
      <View style={styles.safeTop} />

      {/* top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.appName, { color: theme.colors.text }]}>
            SehatScan
          </Text>
          <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
            {currentPatient
              ? `${currentPatient.name} • ${currentPatient.condition?.toUpperCase?.() ?? ''
              }`
              : 'No patient selected'}
          </Text>
        </View>
        <View style={styles.settingsWrapper}>
          <Ionicons
            name="settings-outline"
            size={24}
            color={theme.colors.text}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </View>

      {/* health warning banner */}
      {anyDanger && (
        <View
          style={[
            styles.warningBanner,
            { backgroundColor: theme.colors.danger + '25' },
          ]}
        >
          <MaterialIcons
            name="warning"
            size={22}
            color={theme.colors.danger}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              color: theme.colors.danger,
              fontSize: 13, // smaller than before
              fontWeight: '600',
            }}
            numberOfLines={2}
          >
            Health warning – please review your latest reports.
          </Text>
        </View>
      )}

      <View style={styles.safeSpacerTop} />

      {/* main content */}
      <View style={styles.content}>
        {/* BP card */}
        {bp && (
          <View
            style={[
              styles.card,
              {
                borderColor: getStatusColors(bp.riskLevel).border,
                backgroundColor: getStatusColors(bp.riskLevel).bg,
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconCircle}>
                <MaterialIcons
                  name="favorite-border"
                  size={26}
                  color={theme.colors.text}
                />
              </View>
              <Text
                style={[styles.cardTitle, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                Blood pressure
              </Text>
              {renderStatusIcon(bp.riskLevel)}
            </View>
            <Text
              style={[styles.mainValue, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {bp.lastValue} {bp.unit}
            </Text>
            <Text
              style={{
                color: theme.colors.muted,
                fontSize: 13,
                marginTop: 2,
              }}
            >
              Trend: {bp.trend}
            </Text>
          </View>
        )}

        {/* Sugar card */}
        {sugar && (
          <View
            style={[
              styles.card,
              {
                borderColor: getStatusColors(sugar.riskLevel).border,
                backgroundColor: getStatusColors(sugar.riskLevel).bg,
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconCircle}>
                <MaterialIcons
                  name="opacity"
                  size={26}
                  color={theme.colors.text}
                />
              </View>
              <Text
                style={[styles.cardTitle, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                Blood sugar
              </Text>
              {renderStatusIcon(sugar.riskLevel)}
            </View>
            <Text
              style={[styles.mainValue, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {sugar.lastValue} {sugar.unit}
            </Text>
            <Text
              style={{
                color: theme.colors.muted,
                fontSize: 13,
                marginTop: 2,
              }}
            >
              Trend: {sugar.trend}
            </Text>
          </View>
        )}

        {/* Heart card */}
        {heart && (
          <View
            style={[
              styles.card,
              {
                borderColor: getStatusColors(heart.riskLevel).border,
                backgroundColor: getStatusColors(heart.riskLevel).bg,
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="heart-outline"
                  size={26}
                  color={theme.colors.text}
                />
              </View>
              <Text
                style={[styles.cardTitle, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                Heart rate
              </Text>
              {renderStatusIcon(heart.riskLevel)}
            </View>
            <Text
              style={[styles.mainValue, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {heart.lastValue} {heart.unit}
            </Text>
            <Text
              style={{
                color: theme.colors.muted,
                fontSize: 13,
                marginTop: 2,
              }}
            >
              Trend: {heart.trend}
            </Text>
          </View>
        )}

        {!bp && !sugar && !heart && (
          <Text
            style={{ color: theme.colors.muted, fontSize: 14, marginTop: 12 }}
          >
            No summary values available yet. Scan or add a report from the Scan
            tab.
          </Text>
        )}
      </View>

      {/* safe bottom */}
      <View style={styles.safeBottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeTop: { height: 30 },
  safeBottom: { height: 28 },
  safeSpacerTop: { height: 8 },

  topBar: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: { fontSize: 22, fontWeight: '700' },
  settingsWrapper: {
    padding: 8,
    borderRadius: 999,
  },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8, // slightly smaller
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 14,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10, // smaller than before
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    columnGap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15, // slightly smaller
    fontWeight: '600',
    flex: 1,
  },
  mainValue: {
    fontSize: 22, // slightly smaller
    fontWeight: '700',
  },
});

export default DashboardScreen;
