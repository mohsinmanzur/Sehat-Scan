import { useTheme } from "@context/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { formatFullDateTime } from "src/utils/date";
import { DeltaBadge } from "./delta_badge";
import { HealthMeasurement } from "../../types/types";

export const HistoryRow: React.FC<{ item: HealthMeasurement; secondaryItem?: HealthMeasurement | null; isLast: boolean; delta?: number, measurements: HealthMeasurement[], color?: string }> = ({ item, secondaryItem, isLast, delta, measurements, color }) => {
    const { theme } = useTheme();

    const displayValue = item.numeric_value_2 != null ? `${item.numeric_value}/${item.numeric_value_2}` : `${item.numeric_value}`;

    return (
        <View style={[
            styles.logRow,
            !isLast && { borderBottomColor: theme.backgroundDark, borderBottomWidth: StyleSheet.hairlineWidth },
        ]}>
            <View style={styles.logInfo}>
                <Text style={[styles.logWeight, { color: theme.text }]}>
                    {displayValue} {item.measurement_unit?.symbol}
                </Text>
                <Text style={[styles.logDate, { color: theme.textLight }]}>{formatFullDateTime(item.created_at)}</Text>
            </View>
            <DeltaBadge delta={delta} unit={item.measurement_unit?.symbol} measurements={measurements} color={color} />
        </View>
    );
};

const styles = StyleSheet.create({
    logRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 14,
        gap: 14,
    },
    logRowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    logInfo: {
        flex: 1,
    },
    logWeight: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    logDate: {
        fontSize: 12,
        fontWeight: '400',
    },
});