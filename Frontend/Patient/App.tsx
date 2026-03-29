import React, { useCallback } from 'react';
import RootNavigator from '@navigation/RootNavigator';
import { ThemeProvider } from 'src/context/ThemeContext';
import { UserProvider } from '@context/UserContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Lexend_400Regular, Lexend_700Bold, Lexend_600SemiBold } from '@expo-google-fonts/lexend';
import { PublicSans_400Regular, PublicSans_600SemiBold } from '@expo-google-fonts/public-sans';

SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {

  const [fontsLoaded, fontError] = useFonts({
      Lexend_400Regular,
      Lexend_700Bold,
      Lexend_600SemiBold,
      PublicSans_400Regular,
      PublicSans_600SemiBold
    });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <ThemeProvider>
        <UserProvider>
          <RootNavigator />
          <Toast />
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
