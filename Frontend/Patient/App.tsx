import React from 'react';
import RootNavigator from '@navigation/RootNavigator';
import { ThemeProvider } from 'src/context/ThemeContext';
import { UserProvider } from '@context/UserContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <RootNavigator />
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
