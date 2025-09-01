import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

import PrivyWrapper from "../contexts/PrivyProvider";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!loaded) {
    return null;
  }

  return (
    <PrivyWrapper>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="home" />
        <Stack.Screen name="trading" />
        <Stack.Screen name="longshort" />
        <Stack.Screen name="autoclosesettings" />
        <Stack.Screen name="revieworder" />
        <Stack.Screen name="addfunds" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </PrivyWrapper>
  );
}
