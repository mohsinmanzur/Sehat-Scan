import React, { useState, useCallback } from 'react';
import { StyleSheet, View, RefreshControl, FlatList } from 'react-native';
import { useTheme } from 'src/context/ThemeContext';
import { Spacer, ThemedText, ThemedView } from 'src/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccessGrant, HealthMeasurement } from '../../types/types';
import backend from 'src/services/Backend/backend.service';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { UpdatedMeasurementCard } from 'src/components/dashboard/UpdatedMeasurementCard';
import { SkeletonCard } from 'src/components/dashboard/SkeletonCard';
import { ScalePressable } from 'src/components/ScalePressable';
import { FontAwesome5 } from '@expo/vector-icons';

const SharedDashboardScreen: React.FC = () => {

    const { sharingId } = useLocalSearchParams<{ sharingId: string }>();

    const { theme, mode } = useTheme();
    const insets = useSafeAreaInsets();

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [share, setShare] = useState<AccessGrant>();
    const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
    const [units, setUnits] = useState<string[]>([]);

    const fetchSearchDetails = async () => {
        if (sharingId) {
            try {
                const data = await backend.getSharedById(sharingId);
                setShare(data);
                setMeasurements(data.measurements || []);

                const units = [...new Set(data.measurements.map((m: HealthMeasurement) => m.measurement_unit.measurement_group))].reverse();
                setUnits(units as string[]);
            } catch (error) {
                console.error("Error fetching measurements:", error);
            }
        } else {
            setMeasurements([]);
        }
    };

    const getLatest = (keyword: string, unit_name?: string) => {
        return measurements
            .filter(m => {
                const groupMatch = m.measurement_unit.measurement_group.match(keyword);
                if (unit_name) {
                    return groupMatch && m.measurement_unit.unit_name === unit_name;
                }
                return groupMatch;
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    };

    useFocusEffect(
        useCallback(() => {
            fetchSearchDetails().finally(() => setIsLoading(false));
        }, [sharingId])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSearchDetails();
        setRefreshing(false);
    };

    return (
        <ThemedView safe style={{ backgroundColor: theme.backgroundDark, paddingTop: insets.top }} >
            <View style={styles.mainContainer}>
                <View style={{ backgroundColor: theme.primary, padding: 8, paddingHorizontal: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ThemedText type='h3' style={{ color: theme.backgroundDark, fontSize: 15 }}>Viewing {share?.patient.name}'s Health Reports</ThemedText>
                    <ScalePressable onPress={() => { router.back(); }}>
                        <FontAwesome5 name="times" size={19} color={theme.backgroundDark} />
                    </ScalePressable>
                </View>

                <ThemedText style={{ color: theme.textGray, marginBottom: 10, marginTop: 15, fontSize: 14, lineHeight: 20, marginHorizontal: 20 }}>
                    Here are all the health records being shared.
                </ThemedText>

                {isLoading ? (
                    <FlatList
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        data={[1, 2, 3, 4]} // Ghost boxes
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
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[theme.primary]}
                                tintColor={theme.primary}
                                progressBackgroundColor={theme.backgroundLight}
                            />
                        }
                        renderItem={({ item: unit, index }) => {

                            const latest = getLatest(unit);
                            const secondaryLatest = latest?.numeric_value_2 != null ? { ...latest, numeric_value: latest.numeric_value_2 } : undefined;
                            const iconName = latest?.measurement_unit?.icon_name || 'activity';

                            const isDark = mode === 'dark';
                            const primaryColor = isDark
                                ? (latest?.measurement_unit?.color_dark ?? theme.primary)
                                : (latest?.measurement_unit?.color_light ?? theme.primary);
                            const secondaryColor = primaryColor === theme.primary ? theme.primarySoft : (primaryColor + '22');

                            let fullHistory = measurements
                                .filter(m => m.measurement_unit.measurement_group === unit)
                                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // oldest to newest

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
                                    pathname='/share/SharedDetailedView'
                                />
                            )
                        }
                        }
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
    titleSection: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    cardWrapper: {
        marginHorizontal: 15,
        marginVertical: 7,
        gap: 15,
    },
});

export default SharedDashboardScreen;
