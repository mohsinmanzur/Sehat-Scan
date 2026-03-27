// src/navigation/BottomTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '@screens/Dashboard/DashboardScreen';
import ScanScreen from '@screens/Scan/ScanScreen';
import ShareAccessScreen from '@screens/ShareAccess/ShareAccessScreen';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@context/ThemeContext';

export type BottomTabParamList = {
  Home: undefined;
  Scan: undefined;
  ShareAccess: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabs: React.FC = () => {

  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName='Home'
      id = 'BottomTabs'
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 70,
          paddingBottom: 10,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarIcon: ({ color, focused }) => {
          let icon: keyof typeof Ionicons.glyphMap = 'home-outline';
          switch (route.name) {
            case 'Home':
              icon = focused ? 'home' : 'home-outline';
              break;
            case 'Scan':
              icon = focused ? 'camera' : 'camera-outline';
              break;
            case 'ShareAccess':
              icon = focused ? 'share-social' : 'share-social-outline';
              break;
          }
          const size = route.name === 'Scan' ? 30 : 26;
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen
        name="ShareAccess"
        component={ShareAccessScreen}
        options={{ title: 'Share' }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
