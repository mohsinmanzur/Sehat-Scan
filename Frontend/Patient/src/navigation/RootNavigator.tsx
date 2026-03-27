// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import LandingScreen from '@screens/Auth/LandingScreen';
import LoginScreen from '@screens/Auth/LoginScreen';
import OtpScreen from '@screens/Auth/OtpScreen';
import SettingsScreen from '@screens/Settings/SettingsScreen';
import ReportsScreen from '@screens/Reports/ReportsScreen';
import SplashScreen from '@screens/Splash/SplashScreen';

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

const RootNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator
      id = "RootStack"
      initialRouteName="Landing"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      {/* <Stack.Screen name="Reports" component={ReportsScreen} /> */}
      <Stack.Screen name="Splash" component={SplashScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigator;
