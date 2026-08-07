import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { useCurrentPatient, UserProvider } from '@context/PatientContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDatabase } from '../context/DatabaseContext';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalProvider } from '../context/GlobalContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DatabaseProvider } from '../context/DatabaseContext';
import { NetworkProvider } from '../context/NetworkContext';
import { Snackbar } from 'react-native-snackbar';
import {
  useFonts,
  Lexend_400Regular,
  Lexend_700Bold,
  Lexend_600SemiBold,
  Lexend_800ExtraBold,
  Lexend_900Black
} from '@expo-google-fonts/lexend';
import {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
  PublicSans_700Bold,
  PublicSans_800ExtraBold
} from '@expo-google-fonts/public-sans';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { theme } = useTheme();
  const { isInitialized } = useCurrentPatient();
  const { isDbReady } = useDatabase();

  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular,
    Lexend_700Bold,
    Lexend_800ExtraBold,
    Lexend_900Black,
    Lexend_600SemiBold,
    PublicSans_400Regular,
    PublicSans_500Medium,
    PublicSans_600SemiBold,
    PublicSans_700Bold,
    PublicSans_800ExtraBold,
  });

  const { isUpdatePending, currentlyRunning } = Updates.useUpdates();

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && isInitialized && isDbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isInitialized, isDbReady]);


  // Handle showing snackbar when app is updated and reloads
  useEffect(() => {
    const checkUpdateStatus = async () => {
      try {
        const currentUpdateId = currentlyRunning?.updateId;
        if (!currentUpdateId) return; // Not running an OTA update

        const storedUpdateId = await AsyncStorage.getItem('LAST_UPDATE_ID');

        // If we have a stored ID and it's different from the current one, it means we just updated
        if (storedUpdateId && storedUpdateId !== currentUpdateId) {
          Snackbar.show({
            text: 'App successfully updated!',
            duration: Snackbar.LENGTH_SHORT,
            action: {
              text: 'DISMISS',
              textColor: theme.primary,
            },
          });
        }

        // Store the current update ID so we don't show the message again
        if (storedUpdateId !== currentUpdateId) {
          await AsyncStorage.setItem('LAST_UPDATE_ID', currentUpdateId);
        }
      } catch (e) {
        console.error('Error checking update status:', e);
      }
    };

    checkUpdateStatus();
  }, [currentlyRunning?.updateId]);

  // Handle showing snackbar when a new update is downloaded and pending
  useEffect(() => {
    if (isUpdatePending) {
      Snackbar.show({
        text: 'A new update has been downloaded.',
        duration: Snackbar.LENGTH_INDEFINITE,
        action: {
          text: 'RESTART',
          textColor: theme.primary,
          onPress: () => {
            Updates.reloadAsync();
          },
        },
      });
    }
  }, [isUpdatePending]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.backgroundDark } }} >
        <Stack.Screen name="(auth)" options={{ animation: 'none' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        <Stack.Screen name="health_measurements" options={{ headerShown: false }} />
        <Stack.Screen name="AddNew" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
        <Stack.Screen name="NewShare" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
        <Stack.Screen name="profile" options={{ animation: 'none' }} />
        <Stack.Screen name="share" options={{ headerShown: false, presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      </Stack>
      <Toast />
    </>
  );
}

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DatabaseProvider>
        <ThemeProvider>
          <NetworkProvider>
            <GlobalProvider>
              <SafeAreaProvider>
                <UserProvider>
                  <RootLayoutNav />
                </UserProvider>
              </SafeAreaProvider>
            </GlobalProvider>
          </NetworkProvider>
        </ThemeProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}