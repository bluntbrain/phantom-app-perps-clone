import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SplashScreen } from '../screens/SplashScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { TradingScreen } from '../screens/TradingScreen';
import { AddFundsScreen } from '../screens/AddFundsScreen';
import { LongShortScreen } from '../screens/LongShortScreen';
import { AutoCloseSettingsScreen } from '../screens/AutoCloseSettingsScreen';
import { ReviewOrderScreen } from '../screens/ReviewOrderScreen';
import { colors } from '../constants/colors';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Trading: {
    symbol: string;
    name: string;
  };
  AddFunds: undefined;
  LongShort: {
    symbol: string;
    isLong: boolean;
    autoCloseEnabled?: boolean;
    autoCloseSettings?: any;
  };
  AutoCloseSettings: {
    symbol: string;
    isLong: boolean;
  };
  ReviewOrder: {
    symbol: string;
    isLong: boolean;
    amount: string;
    leverage: string;
    leveragedSize: string;
    currentPrice: number;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background.primary },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Trading" component={TradingScreen} />
        <Stack.Screen name="AddFunds" component={AddFundsScreen} />
        <Stack.Screen name="LongShort" component={LongShortScreen} />
        <Stack.Screen
          name="AutoCloseSettings"
          component={AutoCloseSettingsScreen}
        />
        <Stack.Screen name="ReviewOrder" component={ReviewOrderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
