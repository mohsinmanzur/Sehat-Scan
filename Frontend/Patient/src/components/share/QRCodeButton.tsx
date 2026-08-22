import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
} from 'react-native';
import { ScalePressable } from 'src/components/ScalePressable';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'src/context/ThemeContext';
import { QRCodeCard } from './qr-code';

// Approximate max card height — used as starting translateY so card begins off-screen
const CARD_OFFSET = 600;

export const QRCodeButton: React.FC = () => {
  const { theme } = useTheme();

  // Keep modal mounted until close animation finishes
  const [modalMounted, setModalMounted] = useState(false);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(CARD_OFFSET)).current;

  const openModal = () => {
    setModalMounted(true);
    // Animate both in parallel: backdrop fades, card slides up
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        tension: 68,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    // Animate both out, then unmount
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: CARD_OFFSET,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalMounted(false);
    });
  };

  return (
    <>
      <ScalePressable
        style={[styles.qrButton, { backgroundColor: theme.primarySoft }]}
        onPress={openModal}
      >
        <Ionicons name="qr-code" size={20} color={theme.primary} />
        <Text style={[styles.qrButtonLabel, { color: theme.primary }]}>My QR</Text>
      </ScalePressable>

      {/* ── QR overlay ─────────────────────────────────────────────────────── */}
      <Modal
        visible={modalMounted}
        transparent
        animationType="none"       // We drive ALL animation ourselves
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        {/* Outer container: flex-end so card sticks to the bottom */}
        <View style={styles.modalContainer}>

          {/*
            Dark backdrop — absolutely fills the screen BEHIND the card.
            The card's transparent rounded corners will see this dark layer,
            not the app content underneath.
          */}
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
            pointerEvents="none"
          />

          {/* Invisible pressable that covers the backdrop area to dismiss */}
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />

          {/* Card — slides independently of the backdrop */}
          <Animated.View
            style={[
              styles.sheet,
              { backgroundColor: theme.backgroundLight },
              { transform: [{ translateY: cardTranslateY }] },
            ]}
          >
            <QRCodeCard onClose={closeModal} />
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  qrButtonLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  // ── Modal styles ────────────────────────────────────────────────────────────
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    // No overflow:hidden — that was clipping the shadow and had no benefit here
  },
});
