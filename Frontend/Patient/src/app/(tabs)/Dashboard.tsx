import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, RefreshControl, FlatList, Text } from 'react-native';
import { useCurrentPatient } from '../../context/PatientContext';
import { useTheme } from '../../context/ThemeContext';
import { Header } from '../../components/dashboard';
import { Spacer, ThemedText, ThemedView } from '../../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HealthMeasurement } from '../../types/types';
import { UpdatedMeasurementCard } from '../../components/dashboard/UpdatedMeasurementCard';
import { useMeasurements } from '../../hooks/useMeasurements';
import { SkeletonCard } from '../../components/dashboard/SkeletonCard';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const DashboardScreen: React.FC = () => {
  const { theme, mode } = useTheme();
  const { currentPatient } = useCurrentPatient();
  const insets = useSafeAreaInsets();
  const patientName = currentPatient?.name?.split(' ')[0] || 'Arjun';
  const [refreshing, setRefreshing] = React.useState(false);

  const { measurements, isLoading, isSyncing, refresh } = useMeasurements(currentPatient?.id);

  const units = [...new Set(measurements.map((m: HealthMeasurement) => m.measurement_unit?.measurement_group).filter(Boolean))].reverse() as string[];

  const getLatestMeasurementsForUnit = (keyword: string, unit_name?: string) => {
    return measurements
      .filter(m => {
        const groupMatch = m.measurement_unit?.measurement_group?.match(keyword);
        if (unit_name) {
          return groupMatch && m.measurement_unit?.unit_name === unit_name;
        }
        return groupMatch;
      })
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())[0];
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setRefreshing(true);
        await refresh();
        if (active) setRefreshing(false);
      })();
      return () => { active = false; };
    }, [refresh])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <ThemedView safe style={{ backgroundColor: theme.backgroundDark, paddingTop: insets.top }} >
      {/*<OfflineBanner />
      <DeviceOnlyBanner isDeviceOnly={isDeviceOnly} /> */}
      <View style={styles.mainContainer}>
        <Header name={patientName} />

        <View style={[styles.sectionHeader, { marginTop: 10, marginHorizontal: 7 }]} />

        {isLoading ? (
          <FlatList
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            data={[1, 2, 3, 4]}
            keyExtractor={(item) => item.toString()}
            numColumns={2}
            columnWrapperStyle={styles.cardWrapper}
            renderItem={() => <SkeletonCard />}
          />
        ) : (
          <FlatList
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            data={units}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            columnWrapperStyle={styles.cardWrapper}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || isSyncing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
                progressBackgroundColor={theme.backgroundLight}
              />
            }
            ListEmptyComponent={
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Spacer height={180} />
                <FontAwesome5 name={'plus'} color={theme.primary} size={30} />
                <ThemedText type={'h3'} style={{ textAlign: 'center', paddingTop: 15 }}>
                  {"Add New Measurements!"}
                </ThemedText>
                <ThemedText style={{ fontSize: 14, color: theme.textGray, paddingHorizontal: 30, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                  {'Start by adding new measurements here.'}
                </ThemedText>
              </View>
            }
            renderItem={({ item: unit, index }) => {
              const latest = getLatestMeasurementsForUnit(unit);
              const secondaryLatest = latest?.numeric_value_2 != null ? { ...latest, numeric_value: latest.numeric_value_2 } : undefined;
              const iconName = latest?.measurement_unit?.icon_name || 'activity';

              const isDark = mode === 'dark';
              const primaryColor = isDark
                ? (latest?.measurement_unit?.color_dark ?? theme.primary)
                : (latest?.measurement_unit?.color_light ?? theme.primary);
              const secondaryColor = primaryColor === theme.primary ? theme.primarySoft : (primaryColor + '22');

              let fullHistory = measurements
                .filter(m => m.measurement_unit?.measurement_group === unit)
                .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());

              let itemHistory = fullHistory;

              return (
                <UpdatedMeasurementCard
                  id={unit.toLowerCase().replace(/\s/g, '_')}
                  item={latest}
                  secondaryItem={secondaryLatest}
                  iconName={iconName}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  itemHistory={itemHistory}
                  fullHistory={fullHistory}
                  pathname='/health_measurements/DetailedView'
                />
              );
            }}
            ListFooterComponent={<View style={{ height: 80 }} />}
          />
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    marginBottom: 80,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  cardWrapper: {
    marginHorizontal: 15,
    marginVertical: 7,
    gap: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyBox: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Lexend_700Bold',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Lexend_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DashboardScreen;
