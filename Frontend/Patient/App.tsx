import React from 'react';
import RootNavigator from '@navigation/RootNavigator';
import { ThemeProvider } from 'src/context/ThemeContext';
import { UserProvider } from '@context/UserContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
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
