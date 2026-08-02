import React, { useState } from "react";
import { useTheme } from "@context/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { Colors } from "@theme/colors";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { ScalePressable } from "../ScalePressable";
import { router } from "expo-router";
import { LineChart } from 'react-native-wagmi-charts'; // 1. Import Wagmi Charts
import { HealthMeasurement } from "../../types/types";

interface UpdatedMeasurementCardProps {
    id: string;
    item: HealthMeasurement;
    secondaryItem?: HealthMeasurement;
    iconName: string;
    primaryColor: string;
    secondaryColor: string;
    itemHistory: HealthMeasurement[];
    fullHistory?: HealthMeasurement[];
    pathname: string;
}

export const UpdatedMeasurementCard: React.FC<UpdatedMeasurementCardProps> = ({ id, item, secondaryItem, iconName, primaryColor, secondaryColor, itemHistory, fullHistory, pathname }) => {

    const { theme } = useTheme();
    const styles = StylesFunc(theme);

    // Default to an initial guess, then update dynamically when the view renders
    const [chartWidth, setChartWidth] = useState(60);

    // Filter history to only include measurements with the same unit as the current item,
    // so the chart doesn't mix values from different measurement units within the same group.
    const filteredHistory = itemHistory?.filter(h => h.unit_id === item.unit_id) || [];

    let chartData = [];

    if (filteredHistory.length === 0) {
        chartData = [{ timestamp: 0, value: 0 }, { timestamp: 1, value: 0 }];
    } else if (filteredHistory.length === 1) {
        chartData = [{ timestamp: 0, value: filteredHistory[0].numeric_value }, { timestamp: 1, value: filteredHistory[0].numeric_value }];
    } else {
        chartData = filteredHistory.map((val, index) => ({ timestamp: index, value: val.numeric_value }));
    }

    return (
        <View style={{ flex: 1, backgroundColor: primaryColor, borderRadius: 15, maxWidth: '48%', elevation: 0 }} >
            <ScalePressable
                key={id}
                style={[styles.container]}
                disabled={!item}
                onPress={() => router.push({ pathname: pathname, params: { data: JSON.stringify(fullHistory || itemHistory), primaryColor, secondaryColor } })}
            >
                {/* Top Row */}
                <View style={styles.topRow}>
                    <FontAwesome5 name={iconName} size={24} color={primaryColor} />

                    {/* Chart*/}
                    <View
                        style={{ width: '50%', height: 0, marginTop: -15, alignItems: 'flex-end' }}
                        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
                    >
                        {chartWidth > 0 && (
                            <LineChart.Provider data={chartData}>
                                <LineChart width={chartWidth} height={90}>
                                    <LineChart.Path color={primaryColor} width={3} />
                                </LineChart>
                            </LineChart.Provider>
                        )}
                    </View>
                </View>

                {/* Title and Value */}
                <View style={styles.titleRow}>
                    <ThemedText type={'title'} style={[styles.value]}>{item.numeric_value}</ThemedText>
                    {secondaryItem && (
                        <ThemedText numberOfLines={1} ellipsizeMode="tail" type={'title'} style={[styles.value, { fontSize: 22 }]}>/{secondaryItem.numeric_value}</ThemedText>
                    )}
                    <ThemedText numberOfLines={1} ellipsizeMode="tail" type={'subtitle'} style={[styles.unit, { flexShrink: 1 }]}> {item.measurement_unit.symbol}</ThemedText>
                </View>

                <ThemedText numberOfLines={1} ellipsizeMode="tail" type={'subtitle'}>
                    {item.measurement_unit.measurement_group}
                </ThemedText>
            </ScalePressable>
        </View>
    )
}

const StylesFunc = (theme: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.backgroundLight,
        padding: 20,
        borderRadius: 12,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 50,
    },
    value: {
        color: theme.text,
    },
    unit: {
        marginLeft: 3,
        fontFamily: 'PublicSans_300Light',
    }
})