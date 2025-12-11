import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { InsightSeries } from '@types/models';
import { useAppTheme } from '@theme/ThemeContext';

interface Props {
  insight: InsightSeries;
}

const screenWidth = Dimensions.get('window').width;

const GraphCard: React.FC<Props> = ({ insight }) => {
  const { theme } = useAppTheme();

  const labels = insight.points.map(p => p.date.split('-').slice(1).join('/'));
  const data = insight.points.map(p => p.value);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{insight.title}</Text>
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data
            }
          ]
        }}
        width={screenWidth - 40}
        height={180}
        yAxisLabel=""
        yAxisSuffix={` ${insight.unit}`}
        chartConfig={{
          backgroundColor: theme.colors.card,
          backgroundGradientFrom: theme.colors.card,
          backgroundGradientTo: theme.colors.card,
          decimalPlaces: 1,
          color: (opacity = 1) => theme.colors.primary,
          labelColor: (opacity = 1) => theme.colors.muted,
          propsForDots: {
            r: '3'
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 12
        }}
      />
      <Text style={[styles.description, { color: theme.colors.muted }]}>{insight.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12
  },
  title: {
    fontSize: 15,
    fontWeight: '600'
  },
  description: {
    fontSize: 13,
    marginTop: 4
  }
});

export default GraphCard;
