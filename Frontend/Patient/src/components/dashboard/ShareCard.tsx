import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ScalePressable } from 'src/components/ScalePressable';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'src/context/ThemeContext';

export const ShareCard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>Share with Doctor</Text>
      
      <Text style={[styles.description, { color: theme.textGray }]}>
        Securely send your latest reports to your primary care physician via encrypted link.
      </Text>

      <View style={styles.actionRow}>
        <View style={styles.avatarGroup}>
          <Image source={{ uri: 'https://ui-avatars.com/api/?name=Dr+S&background=random' }} style={[styles.avatar, { borderColor: theme.card }]} />
          <Image source={{ uri: 'https://ui-avatars.com/api/?name=Dr+A&background=random' }} style={[styles.avatar, styles.avatarOverlay, { borderColor: theme.card }]} />
          <View style={[styles.avatarMore, styles.avatarOverlay, { borderColor: theme.card, backgroundColor: theme.textVeryLight }]}>
            <Text style={styles.avatarMoreText}>+2</Text>
          </View>
        </View>
        
        <ScalePressable style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#FFFFFF" style={styles.iconShift} />
        </ScalePressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
  },
  avatarOverlay: {
    marginLeft: -16,
  },
  avatarMore: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMoreText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  sendButton: {
    backgroundColor: '#2A5CFF',
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2A5CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  iconShift: {
    marginLeft: 4, // Visual balance for send icon
  },
});
