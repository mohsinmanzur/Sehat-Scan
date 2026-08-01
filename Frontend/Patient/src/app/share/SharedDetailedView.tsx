import { useTheme } from '@context/ThemeContext';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, RefreshControl } from 'react-native';
import { ThemedText, ThemedView } from 'src/components';
import backend from 'src/services/Backend/backend.service';
import { useCurrentPatient } from '@context/PatientContext';
import { getRelativeTimeRange } from 'src/utils/date';
import { ScalePressable } from 'src/components/ScalePressable';
import { HistoryRow } from 'src/components/detailed_view/history_row';
import { WeightChart } from 'src/components/detailed_view/weight_chart';
import { Header } from 'src/components/detailed_view/header';
import { GhostElement } from 'src/components/GhostElement';
import { ReferenceRange, HealthMeasurement } from '../../types/types';
import { findBestReferenceRange } from 'src/helpers/detailed_view.helpers';

export default function DetailedViewScreen() {
    const { data, primaryColor, secondaryColor } = useLocalSearchParams<{ data: string; primaryColor: string; secondaryColor: string }>();
    const { theme } = useTheme();

    const [isLoading, setIsLoading] = useState(true);

    const [allMeasurements, setAllMeasurements] = useState<HealthMeasurement[]>([]);
    const [diastolicMeasurements, setDiastolicMeasurements] = useState<(HealthMeasurement | null)[]>([]);

    const [bestReferenceRange, setBestReferenceRange] = useState<ReferenceRange | null>();


    const [selectedUnitName, setSelectedUnitName] = useState<string | null>(null);

    const sourceMeasurements = useMemo(() => {
        if (!data) return [];
        try {
            const parsed = JSON.parse(data);
            return parsed.sort((a: HealthMeasurement, b: HealthMeasurement) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } catch {
            return [];
        }
    }, [data]);

    const groupName = sourceMeasurements[0]?.measurement_unit?.measurement_group;

    const availableUnits = useMemo(() => {
        if (!groupName) return [];
        const units = sourceMeasurements
            .filter((m: HealthMeasurement) => m.measurement_unit?.measurement_group?.toLowerCase() === groupName.toLowerCase())
            .map((m: HealthMeasurement) => m.measurement_unit?.unit_name)
            .filter(Boolean) as string[];
        return [...new Set(units)];
    }, [sourceMeasurements, groupName]);

    useEffect(() => {
        if (availableUnits.length > 0 && !selectedUnitName) {
            setSelectedUnitName(sourceMeasurements[0]?.measurement_unit?.unit_name || availableUnits[0]);
        }
    }, [availableUnits, sourceMeasurements, selectedUnitName]);

    const processMeasurements = useCallback(async () => {
        if (!groupName || !selectedUnitName || sourceMeasurements.length === 0) return;
        setIsLoading(true);
        try {
            let filtered = sourceMeasurements.filter((m: HealthMeasurement) =>
                m.measurement_unit?.measurement_group?.toLowerCase() === groupName.toLowerCase() &&
                m.measurement_unit?.unit_name === selectedUnitName
            );

            let alignedDiastolic: (HealthMeasurement | null)[] = filtered.map((m: HealthMeasurement) =>
                m.numeric_value_2 != null ? { ...m, numeric_value: m.numeric_value_2 } : null
            );

            if (filtered.length === 0) {
                router.back();
                return;
            }

            setAllMeasurements(filtered);
            setDiastolicMeasurements(alignedDiastolic);

            const ranges = await backend.getReferenceRanges(filtered[0].measurement_unit.id);
            setBestReferenceRange(findBestReferenceRange(filtered[0], ranges));

        } catch (error) {
            console.error("Failed to fetch measurements", error);
        } finally {
            setIsLoading(false);
        }
    }, [sourceMeasurements, groupName, selectedUnitName]);

    useEffect(() => {
        processMeasurements();
    }, [processMeasurements]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const stats = React.useMemo(() => {
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
            {/* Header */}
            <Header title={`${groupName || 'Measurements'} History`} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Current Weight ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {availableUnits.length > 1 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
                            {availableUnits.map(unit => {
                                const isSelected = unit === selectedUnitName;
                                return (
                                    <ScalePressable
                                        key={unit}
                                        onPress={() => setSelectedUnitName(unit)}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 20,
                                            backgroundColor: isSelected ? (primaryColor || theme.primary) : theme.backgroundLight,
                                            borderWidth: 1,
                                            borderColor: isSelected ? (primaryColor || theme.primary) : theme.backgroundLight,
                                        }}
                                    >
                                        <Text style={{
                                            color: isSelected ? '#fff' : theme.text,
                                            fontWeight: isSelected ? '700' : '500',
                                            fontSize: 14
                                        }}>
                                            {unit}
                                        </Text>
                                    </ScalePressable>
                                );
                            })}
                        </ScrollView>
                    )}

                    <Text style={[styles.currentLabel, { color: theme.textLight }]}>CURRENT {groupName?.toUpperCase()}</Text>
                    {isLoading ? (
                        <GhostElement style={{ height: 68, width: 140, borderRadius: 8, marginBottom: 14, marginLeft: 20 }} />
                    ) : (() => {
                        const measurement = allMeasurements.length > 0 ? allMeasurements[allMeasurements.length - 1] as HealthMeasurement : null;
                        const primaryVal = measurement?.numeric_value;
                        const measurement2 = measurement?.numeric_value_2;

                        return (
                            <View style={styles.currentRow}>
                                <Text style={[styles.currentValue, { color: theme.text }]}>{primaryVal}</Text>
                                {measurement2 !== undefined && measurement2 !== null && <Text style={[styles.currentValue, { color: theme.text, fontSize: 45 }]}>/{measurement2}</Text>}
                                <Text style={[styles.currentUnit, { color: theme.text }]}>{allMeasurements?.[0]?.measurement_unit?.symbol}</Text>
                            </View>
                        );
                    })()}

                    {isLoading ? (
                        <GhostElement style={{ height: 38, width: 180, borderRadius: 24, marginBottom: 24 }} />
                    ) : (
                        stats && (
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
                                            {` ${allMeasurements?.[0]?.measurement_unit?.symbol}`}
                                        </ThemedText>
                                    ) : (
                                        <ThemedText> - </ThemedText>
                                    )}
                                </Text>
                            </View>
                        )
                    )}
                </Animated.View>

                {/* ── Trend Card ── */}
                <Animated.View
                    style={[
                        styles.card,
                        { backgroundColor: theme.backgroundLight, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <View style={styles.cardHeader}>
                        {isLoading ? (
                            <GhostElement style={{ height: 20, width: 150, borderRadius: 4, marginBottom: 3 }} />
                        ) : stats ? (<View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <Text style={[styles.statsPillIcon, { color: primaryColor || theme.primary }]}>
                                {stats.isNeutral ? '•' : (stats.isDown ? '↘' : '↗')}
                            </Text>
                            <Text style={[styles.statsPillMain, { color: theme.text }]}> {stats.diff} {allMeasurements?.[0]?.measurement_unit?.symbol}</Text>
                            <Text style={[styles.statsPillSub, { color: theme.textGray }]}>  over {stats.timeRange}</Text>
                        </View>
                        ) : null}
                    </View>

                    {isLoading ? (
                        <GhostElement style={{ height: 180, borderRadius: 12, marginTop: 10 }} />
                    ) : (
                        <WeightChart measurements={allMeasurements} secondaryMeasurements={diastolicMeasurements} color={primaryColor} />
                    )}
                </Animated.View>

                {/* ── History ── */}
                <Animated.View
                    style={{
                        opacity: fadeAnim, transform: [{ translateY: slideAnim }],
                    }}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>History</Text>
                    </View>

                    <View style={[styles.logCard, { backgroundColor: theme.backgroundLight }]}>
                        {isLoading ? (
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
                                        onPress={() => { router.push({ pathname: `/health_measurements/ItemDetail`, params: { id: item.id, data: JSON.stringify(item), data2: JSON.stringify(diastolicMeasurements?.[idx]), primaryColor, secondaryColor, guestMode: "true" } }) }}
                                        key={item.id}
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
    safe: {
        flex: 1,
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
        paddingTop: 8,
    },

    // Current weight
    currentLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1.4,
        marginBottom: 6,
        marginTop: 4,
    },
    currentRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 14,
    },
    currentValue: {
        fontSize: 68,
        fontWeight: '900',
        lineHeight: 68,
        letterSpacing: -2,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 1,
    },
    currentUnit: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 0,
        marginLeft: 4,
    },

    // Stats pill
    statsPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 9,
        marginBottom: 24,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1.5,
    },
    statsPillIcon: {
        fontSize: 14,
        fontWeight: '700',
    },
    statsPillMain: {
        fontSize: 14,
        fontWeight: '700',
    },
    statsPillSub: {
        fontSize: 13,
        fontWeight: '400',
    },

    // Card
    card: {
        borderRadius: 20,
        padding: 20,
        paddingTop: 17,
        marginBottom: 28,
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1.5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 3,
    },
    cardSub: {
        fontSize: 13,
        fontWeight: '400',
    },

    // Section
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Log card
    logCard: {
        borderRadius: 20,
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1,
    },
});