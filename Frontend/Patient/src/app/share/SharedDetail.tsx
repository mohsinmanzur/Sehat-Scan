import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Spacer, ThemedText, ThemedView } from "src/components";
import { Header } from "src/components/detailed_view/header";
import { useTheme } from 'src/context/ThemeContext';
import backend from 'src/services/Backend/backend.service';
import { useCurrentPatient } from '@context/PatientContext';
import { AccessGrant, HealthMeasurement } from '../../types/types';
import { formatFullDateTime } from 'src/utils/date';
import { ScalePressable } from 'src/components/ScalePressable';
import { router } from 'expo-router';
import { GhostElement } from 'src/components/GhostElement';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCamera, faCameraAlt, faCameraRetro, faCircleXmark, faCopy, faQrcode, faVideoCamera } from '@fortawesome/free-solid-svg-icons';
import { Snackbar } from 'react-native-snackbar';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SharedDetailScreen = () => {
    const { data } = useLocalSearchParams<{ data: string }>();
    const { currentPatient } = useCurrentPatient();
    const { theme, mode } = useTheme();
    const insets = useSafeAreaInsets();

    const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
    const [units, setUnits] = useState<string[]>([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [isRevokeLoading, setIsRevokeLoading] = useState(false);

    const share: AccessGrant | null = React.useMemo(() => {
        const getMeasurements = async () => {

            const parsed: AccessGrant = JSON.parse(data);

            const temp: HealthMeasurement[] = await backend.getMeasurementsForShare(parsed.id);
            setMeasurements(temp);

            const unitSet = new Set<string>(['All']);
            temp.forEach(measurement => {
                const group = measurement.measurement_unit.measurement_group;

                if (group) {
                    unitSet.add(group);
                }    
            });
            setUnits(Array.from(unitSet));
        }

        try {
            if (data) getMeasurements();
            return JSON.parse(data);
        }
        catch (e) {
            console.error("Failed to parse sharedMeasurementIds", e);
            return null;
        }
        finally {
            setIsLoading(false);
        }
    }, [data]);

    const handleRevokeAccess = async () => {
        setIsRevokeLoading(true);

        try {
            await backend.revokeShare(currentPatient.id, share.id);
            router.back();
            Snackbar.show({ text: 'Access revoked successfully', duration: Snackbar.LENGTH_SHORT, backgroundColor: theme.primarySoft, textColor: theme.primary });
        } catch (error: any) {
            Snackbar.show({ text: `Failed to revoke access: ${error.message}`, duration: Snackbar.LENGTH_SHORT, backgroundColor: theme.danger, textColor: theme.text });
        } finally {
            setIsRevokeLoading(false);
        }
    }

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="Shared Reports" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}>
                <ThemedText style={styles.title}>Health Records</ThemedText>
                <ThemedText style={{ color: theme.textGray, fontSize: 14, lineHeight: 20 }}>
                    These are the records you've shared.
                </ThemedText>

                <Spacer height={20} />

                {/* Access Card */}
                <ScalePressable
                    onPress={async () => {
                        if (share?.access_token) {
                            await Clipboard.setStringAsync(share.access_token);
                            Snackbar.show({
                                text: 'Access code copied to clipboard!',
                                duration: Snackbar.LENGTH_SHORT,
                                backgroundColor: theme.primarySoft,
                                textColor: theme.primary
                            });
                        }
                    }}
                    style={{ backgroundColor: theme.backgroundLight, padding: 20, borderRadius: 15 }}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                        <View>
                            <ThemedText style={{ color: theme.textGray, fontSize: 13, marginBottom: -3 }}>
                                ACCESS CODE
                            </ThemedText>

                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 15 }}>
                                <ThemedText type={'h1'} style={{ color: theme.primary, fontSize: 35, letterSpacing: 1 }}>
                                    {share?.access_token?.substring(0, 3)} {share?.access_token?.substring(3)}
                                </ThemedText>
                                <FontAwesomeIcon icon={faCopy} size={18} color={theme.textGray} />
                            </View>
                        </View>

                        <ScalePressable
                            onPress={() => router.push({ pathname: '/share/ScanQR', params: { shareId: share?.id } })}
                            style={{ padding: 10, marginRight: 5, marginTop: 15, backgroundColor: theme.primarySoft, borderRadius: 10 }}
                        >
                            <FontAwesomeIcon icon={faQrcode} size={24} color={theme.primary} />
                        </ScalePressable>

                    </View>
                </ScalePressable>

                <Spacer height={25} />

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
                            return (
                                <ScalePressable
                                    key={f}
                                    style={[styles.filterChip, { backgroundColor: isActive ? theme.primary : theme.backgroundLight }]}
                                    onPress={() => setActiveFilter(f)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
                            if (!matchesFilter) return false;
                            const measurement2 = item.numeric_value_2;
                            return true;
                        }).map(item => {
                            const isDark = mode === 'dark';
                            const primaryColor = isDark
                                ? (item.measurement_unit?.color_dark ?? theme.primary)
                                : (item.measurement_unit?.color_light ?? theme.primary);
                            const secondaryColor = primaryColor === theme.primary ? theme.primarySoft : (primaryColor + '22');
                            const iconName = item.measurement_unit?.icon_name || 'activity';

                            return (
                                <ScalePressable
                                    key={item.id}
                                    style={[styles.listItem, { backgroundColor: theme.backgroundLight }]}
                                    activeOpacity={0.7}
                                    onPress={() => { router.push({ pathname: `/health_measurements/ItemDetail`, params: { id: item.id, data: JSON.stringify(item), primaryColor, secondaryColor } }) }}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: secondaryColor }]}>
                                        <FontAwesome5 name={iconName} size={22} color={primaryColor} />
                                    </View>

                                    <View style={styles.itemContent}>
                                        <View style={styles.valRow}>
                                            <ThemedText style={styles.itemValue}>{item.numeric_value}</ThemedText>
                                            <ThemedText style={styles.itemUnit}> {item.measurement_unit.symbol}</ThemedText>
                                        </View>
                                        <ThemedText style={styles.itemSubtext}>
                                            {item.measurement_unit.measurement_group} • {formatFullDateTime(item.created_at)}
                                        </ThemedText>
                                    </View>
                                </ScalePressable>
                            );
                        })}
                    </View>
                }
            </ScrollView>
            <ScalePressable
                style={[styles.revokeButtonContainer, { bottom: insets.bottom + 30 }, isRevokeLoading && { backgroundColor: '#a01717' }]}
                onPress={handleRevokeAccess}
                disabled={isRevokeLoading}
            >
                {isRevokeLoading ? (
                    <ActivityIndicator color="#FFFFFF" style={{ paddingVertical: 2 }} />
                ) : <>
                    <FontAwesomeIcon icon={faCircleXmark} color='#FFFFFF' size={18} style={{ marginTop: 1 }} />
                    <ThemedText type={'h3'} style={{ color: '#FFFFFF' }}>
                        Revoke Access
                    </ThemedText>
                </>
                }
            </ScalePressable>
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
    revokeButtonContainer: {
        flexDirection: 'row',
        backgroundColor: '#BA1A1A',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        marginTop: 15,
        gap: 7,
        position: 'absolute',
        left: 30,
        right: 30,
        elevation: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
});

export default SharedDetailScreen;