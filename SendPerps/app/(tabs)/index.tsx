import { usePrivy } from "@privy-io/expo";
import { View, Text, ActivityIndicator } from 'react-native';
import LoginScreen from '../../components/LoginScreen';
import UserScreen from '../../components/UserScreen';

export default function HomeScreen() {
  const { user } = usePrivy();

  console.log('Privy user:', user);

  // Show login screen if no user, otherwise show user screen
  return user ? <UserScreen /> : <LoginScreen />;
}
