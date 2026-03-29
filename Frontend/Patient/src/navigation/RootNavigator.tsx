import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import LoginScreen from '@screens/Auth/LoginScreen';
import OtpScreen from '@screens/Auth/OtpScreen';
import SettingsScreen from '@screens/Settings/SettingsScreen';
import SplashScreen from '@screens/Splash/SplashScreen';
import { Colors } from '../constants/colors';
import { useColorScheme } from 'react-native';

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Otp: { patientEmail: string };
  MainTabs: undefined;
  Settings: undefined;
  Reports: undefined;
  Splash: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
  <NavigationContainer theme = {{...DefaultTheme, colors: {...DefaultTheme.colors, background: theme.backgroundDark}}}>
    <Stack.Navigator
      id = "RootStack"
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      {/* <Stack.Screen name="Reports" component={ReportsScreen} /> */}
      <Stack.Screen name="Splash" component={SplashScreen} />
    </Stack.Navigator>
  </NavigationContainer>
)};

export default RootNavigator;
