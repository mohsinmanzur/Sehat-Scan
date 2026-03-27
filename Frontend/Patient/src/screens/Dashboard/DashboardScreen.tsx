import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCurrentPatient } from '@context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@context/ThemeContext';
import backend from 'src/services/Backend/backend.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native-gesture-handler';

const DashboardScreen: React.FC = async () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const { currentPatient } = useCurrentPatient();
  const healthMeasurements = await backend.getMeasurementsByPatient(currentPatient?.id);

  const getStatusColors = (risk) => {
    if (risk === 'normal')
      return {
        border: theme.success + '80',
        bg: theme.success + '18',
      };
    if (risk === 'borderline')
      return {
        border: theme.warning + '99',
        bg: theme.warning + '20',
      };
    return {
      border: theme.danger + 'aa',
      bg: theme.danger + '20',
    };
  };

  const renderStatusIcon = (risk) => {
    if (risk === 'normal') {
      return (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={theme.success}
        />
      );
    }
    if (risk === 'borderline') {
      return (
        <MaterialIcons
          name="error-outline"
          size={24}
          color={theme.warning}
        />
      );
    }
    return (
      <MaterialIcons
        name="warning"
        size={24}
        color={theme.danger}
      />
    );
  };

  const bp = getStatusColors('normal');
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

      {/* top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.appName, { color: theme.text }]}>
            SehatScan
          </Text>
          <Text style={{ color: theme.muted, fontSize: 12 }}>
            {currentPatient
              ? `${currentPatient.name} •`
              : 'No patient selected'}
          </Text>
        </View>
        <View style={styles.settingsWrapper}>
          <Ionicons
            name="settings-outline"
            size={24}
            color={theme.text}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </View>

      {/* health warning banner */}
      {true && (
        <View
          style={[
            styles.warningBanner,
            { backgroundColor: theme.danger + '25' },
          ]}
        >
          <MaterialIcons
            name="warning"
            size={22}
            color={theme.danger}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              color: theme.danger,
              fontSize: 13, // smaller than before
              fontWeight: '600',
            }}
            numberOfLines={2}
          >
            Health warning – please review your latest reports.
          </Text>
        </View>
      )}

      {/* main content */}
      <View style={styles.content}>

        <FlatList 
          data = {healthMeasurements}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <Text style={{ color: theme.muted, fontSize: 14, marginTop: 12 }} >
              No summary values available yet. Scan or add a report from the Scan tab.
            </Text>
          )}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                {
                  borderColor: getStatusColors('normal').border,
                  backgroundColor: getStatusColors('normal').bg,
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.iconCircle}>
                  <MaterialIcons
                    name="favorite-border"
                    size={26}
                    color={theme.text}
                  />
                </View>
                <Text
                  style={[styles.cardTitle, { color: theme.text }]}
                  numberOfLines={1}
                >
                  Blood pressure
                </Text>
                {renderStatusIcon('normal')}
              </View>
              <Text
                style={[styles.mainValue, { color: theme.text }]}
                numberOfLines={1}
              >
                10 bpm
              </Text>
              <Text
                style={{
                  color: theme.muted,
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                Trend: hot
              </Text>
            </View>
          )}
        />
      </View>

    </SafeAreaView>
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
