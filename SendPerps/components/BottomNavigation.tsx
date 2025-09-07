import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { haptics } from "../utils/haptics";

interface BottomNavigationProps {
  activeTab?: "home" | "perp" | "history" | "search";
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
}) => {
  const pathname = usePathname();

  // determine active tab based on current route
  const getActiveTab = () => {
    if (activeTab) return activeTab;
    if (pathname.includes("perp")) return "perp";
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
      case "perp":
        router.push("/perp");
        break;
      case "history":
        router.push("/history");
        break;
      case "search":
        // Navigate to search or show search modal
        console.log("Search pressed");
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
          currentTab === "history" && styles.tabItemActive,
        ]}
        onPress={() => handleTabPress("history")}
      >
        <Feather name="clock" size={24} color={getIconColor("history")} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabItem,
          currentTab === "search" && styles.tabItemActive,
        ]}
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
