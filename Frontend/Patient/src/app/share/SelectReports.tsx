import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { ThemedText, ThemedView } from "src/components";
import { Header } from "src/components/detailed_view/header";
import { useTheme } from 'src/context/ThemeContext';
import backend from 'src/services/Backend/backend.service';
import { useCurrentPatient } from '@context/PatientContext';
import { HealthMeasurement } from '../../types/types';
import { formatFullDateTime } from 'src/utils/date';
import { ScalePressable } from 'src/components/ScalePressable';
import { MaterialIcons } from '@expo/vector-icons';
import { useGlobalContext } from '@context/GlobalContext';
import { router } from 'expo-router';
import { GhostElement } from 'src/components/GhostElement';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SelectReportsScreen = () => {
    const { theme, mode } = useTheme();
    const { currentPatient } = useCurrentPatient();
    const { selectedReports, setSelectedReports } = useGlobalContext();

    const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
    const [units, setUnits] = useState<string[]>([]);

    const [activeFilter, setActiveFilter] = useState('All');

    const [isLoading, setIsLoading] = useState(true);

    const insets = useSafeAreaInsets();

    useEffect(() => {
        const getMeasurements = async () => {
            setIsLoading(true);
            const data = await backend.getMeasurementsByPatient(currentPatient!.id);
            setMeasurements(data || []);
            setUnits(['All', ...Array.from(new Set(data?.map(d => d.measurement_unit.measurement_group) || []))]);
            setIsLoading(false);
        }
        getMeasurements();
    }, [currentPatient?.id])

    const toggleSelection = (item: HealthMeasurement) => {
        const next = new Set(selectedReports);
        
        if (next.has(item.id)) {
            next.delete(item.id);
        } else {
            next.add(item.id);
        }
        setSelectedReports(next);
    };

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="Share Reports" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}>
                <ThemedText style={styles.title}>Select Data to Share</ThemedText>
                <ThemedText style={{ color: theme.textGray, marginBottom: 24, fontSize: 14, lineHeight: 20 }}>
                    Choose the specific health measurements you want to include in this report.
                </ThemedText>

                {/* Filters */}
                {isLoading ?
                    <View style={[styles.filterScroll, { flexDirection: 'row', gap: 10, paddingRight: 20 }]}>
                        <GhostElement style={{ width: 60, height: 32, borderRadius: 20 }} />
                        <GhostElement style={{ width: 120, height: 32, borderRadius: 20 }} />
                        <GhostElement style={{ width: 100, height: 32, borderRadius: 20 }} />
                    </View>
                    :
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
                        {units.map(f => {
                            const isActive = activeFilter === f;
                            const filteredMeasurements = measurements.filter(item => {
                                return f === 'All' || item.measurement_unit.measurement_group === f;
                            });
                            const allFilteredelected = filteredMeasurements.length > 0 && filteredMeasurements.every(item => selectedReports.has(item.id));

                            const handleFilterPress = () => {
                                if (isActive) {
                                    // if clicking the active filter, toggle selection for all items in this filter
                                    const next = new Set(selectedReports);
                                    if (allFilteredelected) {
                                        filteredMeasurements.forEach(item => {
                                            next.delete(item.id);
                                        });
                                    } else {
                                        filteredMeasurements.forEach(item => {
                                            next.add(item.id);
                                        });
                                    }
                                    setSelectedReports(next);
                                } else {
                                    setActiveFilter(f);
                                }
                            };

                            return (
                                <ScalePressable
                                    key={f}
                                    style={[styles.filterChip, { backgroundColor: isActive ? theme.primary : theme.backgroundLight }]}
                                    onPress={handleFilterPress}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        {isActive && (
                                            <MaterialIcons
                                                name={allFilteredelected ? "check-circle" : "check-circle-outline"}
                                                size={16}
                                                color="#fff"
                                                style={{ marginBottom: -1 }}
                                            />
                                        )}
                                        <ThemedText style={{ color: isActive ? '#fff' : theme.text, fontWeight: '600' }}>{f}</ThemedText>
                                    </View>
                                </ScalePressable>
                            );
                        })}
                    </ScrollView>
                }


                {/* List Items */}
                {isLoading ?
                    <View style={styles.listContainer}>
                        {[1, 2, 3, 4, 5].map(key => (
                            <View key={key} style={[styles.listItem, { backgroundColor: theme.backgroundLight }]}>
                                <GhostElement style={[styles.iconContainer, { backgroundColor: theme.backgroundDark }]} />

                                <View style={styles.itemContent}>
                                    <View style={styles.valRow}>
                                        <GhostElement style={{ width: '40%', height: 20, borderRadius: 4, marginBottom: 4 }} />
                                    </View>
                                    <GhostElement style={{ width: '70%', height: 14, borderRadius: 4 }} />
                                </View>
                            </View>
                        ))}
                    </View>
                    :
                    <View style={styles.listContainer}>
                        {measurements.filter(item => {
                            const matchesFilter = activeFilter === 'All' || item.measurement_unit.measurement_group === activeFilter;
                            return matchesFilter;
                        }).map(item => {
                            const isSelected = selectedReports.has(item.id);
                            const isDark = mode === 'dark';
                            const primaryColor = isDark
                                ? (item.measurement_unit?.color_dark ?? theme.primary)
                                : (item.measurement_unit?.color_light ?? theme.primary);
                            const secondaryColor = primaryColor === theme.primary ? theme.primarySoft : (primaryColor + '22');
                            const iconName = item.measurement_unit?.icon_name || 'activity';

                            const measurement2 = item.numeric_value_2;

                            return (
                                <ScalePressable
                                    key={item.id}
                                    style={[styles.listItem, { backgroundColor: theme.backgroundLight }]}
                                    activeOpacity={0.7}
                                    onPress={() => toggleSelection(item)}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: secondaryColor }]}>
                                        <FontAwesome5 name={iconName} size={22} color={primaryColor} />
                                    </View>

                                    <View style={styles.itemContent}>
                                        <View style={styles.valRow}>
                                            <ThemedText style={styles.itemValue}>
                                                {item.numeric_value}
                                                {measurement2 != null ? `/${measurement2}` : ''}
                                            </ThemedText>
                                            <ThemedText style={styles.itemUnit}> {item.measurement_unit.symbol}</ThemedText>
                                        </View>
                                        <ThemedText style={styles.itemSubtext}>
                                            {item.measurement_unit.measurement_group} • {formatFullDateTime(item.created_at)}
                                        </ThemedText>
                                    </View>

                                    <Ionicons
                                        name={isSelected ? "checkbox" : "square-outline"}
                                        size={24}
                                        color={isSelected ? theme.primary : theme.textGray}
                                    />
                                </ScalePressable>
                            );
                        })}
                    </View>
                }
            </ScrollView>

            {/* Bottom Bar */}
            {selectedReports.size > 0 &&
                <View style={[styles.bottomBar, { bottom: insets.bottom + 15 }]}>
                    <ScalePressable
                        style={[styles.proceedBtn, { backgroundColor: theme.primary }]}
                        onPress={() => { router.back() }}
                    >
                        <Ionicons name="arrow-forward" size={23} color="#fff" />
                    </ScalePressable>
                </View>
            }
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 110,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 8,
    },
    filterScroll: {
        marginBottom: 20,
        flexGrow: 0,
    },
    filterContent: {
        gap: 10,
        paddingRight: 20,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    listContainer: {
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    itemContent: {
        flex: 1,
        justifyContent: 'center',
    },
    valRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    itemValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    itemUnit: {
        fontSize: 12,
        color: '#6b7280',
    },
    itemSubtext: {
        fontSize: 13,
        color: '#6b7280',
    },
    bottomBar: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        right: 25
    },
    proceedBtn: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 100,
        elevation: 1,
    },
});

export default SelectReportsScreen;