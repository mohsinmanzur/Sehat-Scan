import { Dimensions, StyleSheet, Text, View } from "react-native";
import { HealthMeasurement } from "../../types/types";
import { useTheme } from "@context/ThemeContext";
import { buildAreaPath, buildSmoothPath, formatChartDate } from "src/helpers/detailed_view.helpers";
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Text as SvgText } from "react-native-svg";
import React from "react";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 130;
const PAD_X = 12;
const PAD_Y = 20; // Increased Y padding to ensure highest labels don't get clipped

interface WeightChartProps {
    measurements: HealthMeasurement[];
    secondaryMeasurements: (HealthMeasurement | null)[];
    color: string;
}

export const WeightChart: React.FC<WeightChartProps> = ({ measurements, secondaryMeasurements, color }) => {
    const { theme } = useTheme();

    // measurements are newest-first from the API; reverse to oldest-first for chart
    const chronological = [...measurements].reverse();
    const chronologicalSecondary = [...secondaryMeasurements].reverse();

    if (chronological.length === 0) return null;

    if (chronological.length < 2) {
        chronological[1] = chronological[0];
        chronologicalSecondary[1] = chronologicalSecondary[0];
    }

    const values = chronological.map(d => d.numeric_value);
    const minVal = Math.min(...values) - 0.5;
    const maxVal = Math.max(...values) + 0.5;

    const toX = (i: number) =>
        PAD_X + (i / (chronological.length - 1)) * (CHART_WIDTH - PAD_X * 4);
    const toY = (v: number) =>
        PAD_Y + ((maxVal - v) / (maxVal - minVal)) * (CHART_HEIGHT - PAD_Y * 2);

    const points = chronological.map((d, i) => ({ x: toX(i), y: toY(d.numeric_value) }));
    const linePath = buildSmoothPath(points);
    const areaPath = buildAreaPath(points, CHART_HEIGHT);

    const isTodayDate = (dateStr: string | Date) => {
        const d = new Date(dateStr);
        const today = new Date();
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    };

    // Build x-axis labels: always show first, last ("TODAY"), and up to 2 evenly
    // spaced points in between — max 4 labels total.
    const xLabels: { label: string; isToday: boolean; x: number }[] = (() => {
        const total = chronological.length;
        if (total <= 4) {
            return chronological.map((d, i) => {
                const isLast = i === total - 1;
                return {
                    label: (isLast && isTodayDate(d.created_at!)) ? 'TODAY' : formatChartDate(d.created_at.toString()),
                    isToday: isLast,
                    x: toX(i),
                };
            });
        }
        const indices = [
            0,
            Math.round(total / 3),
            Math.round((2 * total) / 3),
            total - 1,
        ];
        return indices.map(i => {
            const isLast = i === total - 1;
            const d = chronological[i];
            return {
                label: (isLast && isTodayDate(d.created_at)) ? 'TODAY' : formatChartDate(d.created_at.toString()),
                isToday: isLast,
                x: toX(i),
            };
        });
    })();

    return (
        <View>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                <Defs>
                    <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={color || theme.primary} stopOpacity="0.18" />
                        <Stop offset="1" stopColor={color || theme.primary} stopOpacity="0.01" />
                    </LinearGradient>
                </Defs>
                {/* Area fill */}
                <Path d={areaPath} fill="url(#areaGrad)" />
                {/* Line */}
                <Path
                    d={linePath}
                    fill="none"
                    stroke={color || theme.primary}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* One dot per measurement */}
                {points.map((pt, i) => {
                    const isFirst = i === 0;
                    const isLast = i === points.length - 1;
                    const primaryMeas = chronological[i];
                    const secondaryMeas = chronologicalSecondary[i];

                    const displayFirst = primaryMeas?.numeric_value;
                    const displaySecond = secondaryMeas?.numeric_value;

                    const valueStr = displayFirst?.toString();
                    const secondaryValueStr = displaySecond?.toString();

                    return (
                        <React.Fragment key={i}>
                            {/* Inner/Outer circle logic */}
                            {isLast ? (
                                <>
                                    <Circle cx={pt.x} cy={pt.y} r={8} fill={color || theme.primary} opacity={0.15} />
                                    <Circle cx={pt.x} cy={pt.y} r={4.5} fill={color || theme.primary} />
                                    <Circle cx={pt.x} cy={pt.y} r={2} fill="#fff" />
                                </>
                            ) : (
                                <Circle cx={pt.x} cy={pt.y} r={3.5} fill={color || theme.primary} />
                            )}

                            {/* Show label above dot for first and last entries */}
                            <SvgText
                                x={isFirst ? pt.x - 4 : pt.x + 4}
                                y={pt.y - 12} // Place it slightly above the point
                                fill={color || theme.primary}
                                fontSize="12"
                                fontWeight="bold"
                                textAnchor={isFirst ? "start" : "end"} // Align nicely without clipping
                            >
                                {secondaryValueStr !== undefined && secondaryValueStr !== null ? `${valueStr}/${secondaryValueStr}` : valueStr}
                            </SvgText>
                        </React.Fragment>
                    );
                })}
            </Svg>

            {/* X-axis labels — absolutely positioned to align with their data point */}
            <View style={{ height: 20, position: 'relative' }}>
                {xLabels.map(({ label, isToday, x }) => (
                    <Text
                        key={`${label}-${x}`}
                        style={[
                            styles.chartXLabel,
                            { color: color || theme.primary, position: 'absolute', transform: [{ translateX: -24 }], left: x },
                            isToday && { color: color || theme.primary, fontWeight: '700' },
                        ]}
                    >
                        {label}
                    </Text>
                ))}
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    chartEmpty: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartXLabel: {
        fontSize: 11,
        fontWeight: '500',
        paddingHorizontal: 10
    },
});