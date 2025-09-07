import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { haptics } from "../utils/haptics";
import Toast from "react-native-toast-message";

interface BottomNavigationProps {
  activeTab?: "home" | "perp" | "portfolio" | "notifications";
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
}) => {
  const pathname = usePathname();

  // determine active tab based on current route
  const getActiveTab = () => {
    if (activeTab) return activeTab;
    if (pathname.includes("perp")) return "perp";
    if (pathname.includes("home") || pathname === "/") return "home";
    return "home";
  };

  const currentTab = getActiveTab();

  const handleTabPress = (tab: string) => {
    haptics.light();

    switch (tab) {
      case "home":
        router.push("/home");
        break;
      case "perp":
        router.push("/perp");
        break;
      case "portfolio":
        Toast.show({
          type: "info",
          text1: "Coming Soon",
          text2: "Portfolio feature will be available in a future update.",
        });
        break;
      case "notifications":
        Toast.show({
          type: "info",
          text1: "Coming Soon",
          text2: "Notifications feature will be available in a future update.",
        });
        break;
    }
  };

  const getIconColor = (tab: string) => {
    return currentTab === tab ? colors.accent.purple : colors.text.secondary;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tabItem, currentTab === "home" && styles.tabItemActive]}
        onPress={() => handleTabPress("home")}
      >
        <Feather name="home" size={24} color={getIconColor("home")} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabItem, currentTab === "perp" && styles.tabItemActive]}
        onPress={() => handleTabPress("perp")}
      >
        <Feather name="trending-up" size={24} color={getIconColor("perp")} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabItem,
          currentTab === "portfolio" && styles.tabItemActive,
        ]}
        onPress={() => handleTabPress("portfolio")}
      >
        <Feather name="pie-chart" size={24} color={getIconColor("portfolio")} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabItem,
          currentTab === "notifications" && styles.tabItemActive,
        ]}
        onPress={() => handleTabPress("notifications")}
      >
        <Feather name="bell" size={24} color={getIconColor("notifications")} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingTop: spacing.md,
    marginTop: -spacing.md,
  },
  tabItemActive: {
    borderTopWidth: 1,
    borderTopColor: colors.accent.purple,
    paddingTop: spacing.md,
  },
});
