import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScalePressable } from 'src/components/ScalePressable';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'src/context/ThemeContext';

export const InsightCard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Background Graphic using empty colored circles acting as abstract waves */}
      <View style={styles.backgroundGraphic}>
        <Ionicons name="analytics" size={140} color="rgba(255,255,255,0.15)" style={{ transform: [{ rotate: '-15deg' }] }} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Smart Health Insight</Text>
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
        </View>

        <Text style={styles.description}>
          Your blood glucose trends have improved by 12% over the last 3 months. Keep following your current nutrition plan.
        </Text>

        <ScalePressable style={styles.button}>
          <Text style={[styles.buttonText, { color: theme.primary }]}>Read Full Analysis</Text>
        </ScalePressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2A5CFF', // Explicitly using the vibrant blue from the design
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    overflow: 'hidden',
    padding: 24,
    position: 'relative',
    shadowColor: '#2A5CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  backgroundGraphic: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    zIndex: 0,
  },
  content: {
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 8,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
