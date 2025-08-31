/**
 * SendAI Perps - Phantom Perps Clone
 * React Native Trading App
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import 'react-native-gesture-handler';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
