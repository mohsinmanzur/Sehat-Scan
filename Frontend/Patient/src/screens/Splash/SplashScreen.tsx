import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useAppTheme } from '@theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: theme.colors.primary }]}>SehatScan</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
          Secure Health in Your Pocket
        </Text>
      </View>
      <ActivityIndicator size="small" color={theme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center'
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13
  }
});

export default SplashScreen;
