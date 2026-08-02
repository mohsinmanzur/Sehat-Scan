import { useTheme } from '@context/ThemeContext';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, RefreshControl } from 'react-native';
import { ThemedText, ThemedView } from 'src/components';
import { useCurrentPatient } from '@context/PatientContext';
import { getRelativeTimeRange } from 'src/utils/date';
import { ScalePressable } from 'src/components/ScalePressable';
import { HistoryRow } from 'src/components/detailed_view/history_row';
import { WeightChart } from 'src/components/detailed_view/weight_chart';
import { Header } from 'src/components/detailed_view/header';
import { GhostElement } from 'src/components/GhostElement';
import { ReferenceRange, HealthMeasurement } from '../../types/types';
import { findBestReferenceRange } from 'src/helpers/detailed_view.helpers';
import { useMeasurements } from '../../hooks/useMeasurements';
import { useReferenceRanges } from '../../hooks/useReferenceRanges';

export default function DetailedViewScreen() {
    const { data, primaryColor, secondaryColor } = useLocalSearchParams<{ data: string; primaryColor: string; secondaryColor: string }>();
    const { currentPatient } = useCurrentPatient();
    const { theme } = useTheme();

    const initialMeasurements = useMemo(() => {
        if (!data) return [];
        try {
            const parsedData = JSON.parse(data);
            return Array.isArray(parsedData) ? parsedData : [parsedData];
        } catch {
            return [];
        }
    }, [data]);

    const [selectedUnitName, setSelectedUnitName] = useState<string>(
        () => initialMeasurements[initialMeasurements.length - 1]?.measurement_unit?.unit_name ?? ''
    );

    const groupName = useMemo(() => {
        if (initialMeasurements.length > 0) {
            return initialMeasurements[initialMeasurements.length - 1]?.measurement_unit?.measurement_group;
        }
        return null;
    }, [initialMeasurements]);

    const { measurements: allPatientMeasurements, isLoading, isSyncing, refresh, reloadFromCache } = useMeasurements(currentPatient?.id);

    const sourceMeasurements = useMemo(() => {
        return allPatientMeasurements.length > 0 ? allPatientMeasurements : initialMeasurements;
    }, [allPatientMeasurements, initialMeasurements]);

    const availableUnits = useMemo(() => {
        if (!groupName) return [];
        const units = sourceMeasurements
            .filter(m => m.measurement_unit?.measurement_group?.toLowerCase() === groupName.toLowerCase())
            .map(m => m.measurement_unit?.unit_name)
            .filter(Boolean) as string[];
        return [...new Set(units)];
    }, [sourceMeasurements, groupName]);



    const { allMeasurements, diastolicMeasurements } = useMemo(() => {
        if (!groupName || !selectedUnitName || sourceMeasurements.length === 0) {
            return { allMeasurements: [], diastolicMeasurements: [] as (HealthMeasurement | null)[] };
        }

        let filtered = sourceMeasurements.filter(m =>
            m.measurement_unit?.measurement_group?.toLowerCase() === groupName.toLowerCase() &&
            m.measurement_unit?.unit_name === selectedUnitName
        );

        let alignedDiastolic: (HealthMeasurement | null)[] = filtered.map(m =>
            m.numeric_value_2 != null ? { ...m, numeric_value: m.numeric_value_2 } : null
        );

        return { allMeasurements: filtered, diastolicMeasurements: alignedDiastolic };
    }, [sourceMeasurements, groupName, selectedUnitName]);

    const measurement = useMemo(() => {
        if (allMeasurements.length > 0) {
            return allMeasurements[allMeasurements.length - 1] as HealthMeasurement; // Since it's oldest-first, the last one is the latest
        }
        return null;
    }, [allMeasurements]);

    const { ranges: primaryRanges } = useReferenceRanges(measurement?.measurement_unit?.id);

    const [refreshing, setRefreshing] = useState(false);

    const bestReferenceRange: ReferenceRange | null = useMemo(
        () => measurement ? findBestReferenceRange(measurement, primaryRanges, currentPatient ?? undefined) : null,
        [measurement, primaryRanges, currentPatient]
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    }, [refresh]);

    // Reload from SQLite each time the screen comes into focus (e.g. returning from ItemDetail after a delete)
    useFocusEffect(
        useCallback(() => {
            reloadFromCache().catch(() => { });
        }, [reloadFromCache])
    );

    // Navigate back when the last measurement in this group has been deleted
    const hadMeasurementsRef = useRef(false);
    useEffect(() => {
        if (allMeasurements.length > 0) hadMeasurementsRef.current = true;
        if (!isLoading && hadMeasurementsRef.current && allMeasurements.length === 0) {
            router.back();
        }
    }, [isLoading, allMeasurements]);

    const showLoading = isLoading && allMeasurements.length === 0;

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const stats = useMemo(() => {
        if (!allMeasurements || allMeasurements.length < 2) return null;
        const latest = allMeasurements[0];
        const oldest = allMeasurements[allMeasurements.length - 1];
        if (!latest || !oldest) return null;
        const diff = latest.numeric_value - oldest.numeric_value;
        const timeRange = getRelativeTimeRange(oldest.created_at, latest.created_at);
        return {
            diff: diff.toFixed(1),
            timeRange,
            isDown: diff < 0,
            isNeutral: diff === 0
        };
    }, [allMeasurements]);

    return (
        <ThemedView safe style={{ backgroundColor: theme.backgroundDark }}>
            <Header title={`${groupName || 'Measurements'} History`} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || isSyncing}
                        onRefresh={onRefresh}
                        tintColor={primaryColor || theme.primary}
                        colors={[primaryColor || theme.backgroundDark]}
                        progressBackgroundColor={theme.backgroundLight}
                    />
                }
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Text style={[styles.currentLabel, { color: theme.textLight }]}>
                        CURRENT {selectedUnitName.toUpperCase()}
                    </Text>
                    {showLoading ? (
                        <GhostElement style={{ height: 68, width: 140, borderRadius: 8, marginBottom: 14, marginLeft: 20 }} />
                    ) : (() => {
                        const primaryVal = measurement?.numeric_value;
                        const measurement2 = measurement?.numeric_value_2;
                        return (
                            <View style={styles.currentRow}>
                                <Text style={[styles.currentValue, { color: theme.text }]}>{primaryVal}</Text>
                                {measurement2 !== undefined && measurement2 !== null &&
                                    <Text style={[styles.currentValue, { color: theme.text, fontSize: 45 }]}>/{measurement2}</Text>
                                }
                                <Text style={[styles.currentUnit, { color: theme.text }]}>{measurement?.measurement_unit?.symbol}</Text>
                            </View>
                        );
                    })()}

                    {showLoading ? (
                        <GhostElement style={{ height: 38, width: 180, borderRadius: 24, marginBottom: 24 }} />
                    ) : (
                        measurement && (
                            <View style={[styles.statsPill, { backgroundColor: theme.backgroundLight }]}>
                                <Text>
                                    <ThemedText style={{ fontFamily: 'PublicSans_700Bold' }}>Target: </ThemedText>
                                    {bestReferenceRange ? (
                                        <ThemedText>
                                            {bestReferenceRange.min_value}
                                            {bestReferenceRange.min_value_2 != null && `/${bestReferenceRange.min_value_2}`}
                                            {' - '}
                                            {bestReferenceRange.max_value}
                                            {bestReferenceRange.max_value_2 != null && `/${bestReferenceRange.max_value_2}`}
                                            {` ${measurement?.measurement_unit?.symbol}`}
                                        </ThemedText>
                                    ) : (
                                        <ThemedText> - </ThemedText>
                                    )}
                                </Text>
                            </View>
                        )
                    )}
                </Animated.View>

                <Animated.View
                    style={[styles.card, { backgroundColor: theme.backgroundLight, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                >
                    <View style={styles.cardHeader}>
                        {showLoading ? (
                            <GhostElement style={{ height: 20, width: 150, borderRadius: 4, marginBottom: 3 }} />
                        ) : stats ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Text style={[styles.statsPillIcon, { color: primaryColor || theme.primary }]}>
                                    {stats.isNeutral ? '•' : (stats.isDown ? '↘' : '↗')}
                                </Text>
                                <Text style={[styles.statsPillMain, { color: theme.text }]}> {stats.diff} {measurement?.measurement_unit?.symbol}</Text>
                                <Text style={[styles.statsPillSub, { color: theme.textGray }]}>  over {stats.timeRange}</Text>
                            </View>
                        ) : null}
                    </View>
                    {showLoading ? (
                        <GhostElement style={{ height: 180, borderRadius: 12, marginTop: 10 }} />
                    ) : (
                        <WeightChart measurements={allMeasurements} secondaryMeasurements={diastolicMeasurements} color={primaryColor} />
                    )}
                </Animated.View>

                {availableUnits.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }} contentContainerStyle={{ gap: 15 }}>
                        {availableUnits.map(unit => {
                            const isSelected = unit === selectedUnitName;
                            return (
                                <ScalePressable
                                    key={unit}
                                    onPress={() => setSelectedUnitName(unit)}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 6,
                                        borderRadius: 20,
                                        backgroundColor: theme.backgroundLight,
                                        borderWidth: 1,
                                        borderColor: isSelected ? (primaryColor || theme.primary) : theme.backgroundLight,
                                    }}
                                >
                                    <ThemedText style={{
                                        color: isSelected ? theme.text : theme.textGray,
                                        fontWeight: isSelected ? '700' : '500',
                                        fontSize: 14
                                    }}>
                                        {unit}
                                    </ThemedText>
                                </ScalePressable>
                            );
                        })}
                    </ScrollView>
                )}

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>History</Text>
                    </View>
                    <View style={[styles.logCard, { backgroundColor: theme.backgroundLight }]}>
                        {showLoading ? (
                            <View style={{ padding: 16, gap: 16 }}>
                                {[1, 2, 3, 4].map(key => (
                                    <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <GhostElement style={{ width: 44, height: 44, borderRadius: 22 }} />
                                        <View style={{ flex: 1, gap: 8 }}>
                                            <GhostElement style={{ width: '50%', height: 16, borderRadius: 4 }} />
                                            <GhostElement style={{ width: '30%', height: 12, borderRadius: 4 }} />
                                        </View>
                                        <GhostElement style={{ width: 30, height: 16, borderRadius: 4 }} />
                                    </View>
                                ))}
                            </View>
                        ) : (
                            allMeasurements.map((item: HealthMeasurement, idx) => {
                                const nextItem = allMeasurements[idx + 1];
                                const delta = nextItem ? item.numeric_value - nextItem.numeric_value : undefined;
                                const isLast = idx === allMeasurements.length - 1;
                                return (
                                    <ScalePressable
                                        key={item.id}
                                        onPress={() => router.push({
                                            pathname: `/health_measurements/ItemDetail`,
                                            params: { id: item.id, data: JSON.stringify(item), data2: JSON.stringify(diastolicMeasurements?.[idx]), primaryColor, secondaryColor }
                                        })}
                                    >
                                        <HistoryRow
                                            key={item.id}
                                            item={item}
                                            secondaryItem={diastolicMeasurements?.[idx]}
                                            isLast={isLast}
                                            delta={delta}
                                            measurements={allMeasurements}
                                            color={primaryColor}
                                        />
                                    </ScalePressable>
                                );
                            })
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 100, paddingTop: 8 },
    currentLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.4, marginBottom: 6, marginTop: 4 },
    currentRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 14 },
    currentValue: { fontSize: 68, fontWeight: '900', lineHeight: 68, letterSpacing: -2 },
    currentUnit: { fontSize: 22, fontWeight: '600', marginBottom: 0, marginLeft: 4 },
    statsPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 9, marginBottom: 24, elevation: 1.5 },
    statsPillIcon: { fontSize: 14, fontWeight: '700' },
    statsPillMain: { fontSize: 14, fontWeight: '700' },
    statsPillSub: { fontSize: 13, fontWeight: '400' },
    card: { borderRadius: 20, padding: 20, paddingTop: 17, marginBottom: 28, elevation: 1.5 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    cardTitle: { fontSize: 17, fontWeight: '800', marginBottom: 3 },
    cardSub: { fontSize: 13, fontWeight: '400' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '800' },
    logCard: { borderRadius: 20, elevation: 1 },
});
