import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { haptics } from "../utils/haptics";

interface BottomNavigationProps {
  activeTab?: "home" | "refresh" | "history" | "search";
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
}) => {
  const pathname = usePathname();

  // determine active tab based on current route
  const getActiveTab = () => {
    if (activeTab) return activeTab;
    if (pathname.includes("history")) return "history";
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
      case "history":
        router.push("/history");
        break;
      case "refresh":
        // Trigger refresh action
        console.log("Refresh pressed");
        break;
      case "search":
        // Navigate to search or show search modal
        console.log("Search pressed");
        break;
    }
  };

  const getIconColor = (tab: string) => {
    return currentTab === tab ? colors.text.primary : colors.text.secondary;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress("home")}
      >
        <Feather name="home" size={24} color={getIconColor("home")} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress("refresh")}
      >
        <Feather name="refresh-cw" size={24} color={getIconColor("refresh")} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress("history")}
      >
        <Feather name="clock" size={24} color={getIconColor("history")} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress("search")}
      >
        <Feather name="search" size={24} color={getIconColor("search")} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    backgroundColor: colors.background.primary,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
});
