import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { usePrivy } from "@privy-io/expo";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "../components/LoginScreen";
import { colors } from "../constants/colors";
import { spacing, fontSize, borderRadius } from "../constants/spacing";
import { haptics } from "../utils/haptics";
import { PerpsCard } from "../components/PerpsCard";
import { BottomNavigation } from "../components/BottomNavigation";
import { mockPerpsData, PerpsData } from "../data/mockData";


export default function HomeScreen() {
  const { user, logout, isReady } = usePrivy();
  const [selectedFilter, setSelectedFilter] = useState<"Volume" | "24h">(
    "Volume"
  );

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background.primary,
        }}
      >
        <ActivityIndicator size="large" color={colors.text.accent} />
        <Text style={{ color: colors.text.primary, marginTop: 16 }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleFilterPress = (filter: "Volume" | "24h") => {
    haptics.selection();
    setSelectedFilter(filter);
  };

  const handleLogout = async () => {
    haptics.medium();
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getWalletAddress = () => {
    const walletAccount = user?.linked_accounts?.find(
      (account) =>
        (account.type === "wallet" || account.type === "smart_wallet") &&
        "address" in account
    ) as { address: string } | undefined;

    if (walletAccount?.address) {
      return (
        walletAccount.address.slice(0, 6) +
        "..." +
        walletAccount.address.slice(-4)
      );
    }

    return "No wallet";
  };

  const handlePerpsPress = (item: PerpsData) => {
    haptics.medium();
    router.push({
      pathname: "/trading",
      params: {
        symbol: item.symbol,
        name: item.name,
      },
    });
  };

  const renderPerpsItem = ({ item }: { item: PerpsData }) => (
    <PerpsCard
      rank={item.rank}
      symbol={item.symbol}
      leverage={item.leverage}
      volume={item.volume}
      onPress={() => handlePerpsPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Text style={styles.title}>SendAI Perps</Text>
        </View>
        <View style={styles.walletContainer}>
          <View style={styles.walletInfo}>
            <Ionicons
              name="wallet-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={styles.walletAddress}>{getWalletAddress()}</Text>
          </View>
          {user && (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={16}
                color={colors.accent.red}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "Volume" && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterPress("Volume")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "Volume" && styles.filterTextActive,
            ]}
          >
            Volume
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "24h" && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterPress("24h")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "24h" && styles.filterTextActive,
            ]}
          >
            24h
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <View style={styles.tableHeaderLeft}>
          <Text style={styles.tableHeaderText}>#</Text>
          <Text style={[styles.tableHeaderText, { marginLeft: spacing.xl }]}>
            Perps
          </Text>
        </View>
        <Text style={styles.tableHeaderText}>
          Volume <Text style={styles.sortIcon}>↓</Text>
        </Text>
      </View>

      <FlatList
        data={mockPerpsData}
        renderItem={renderPerpsItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <BottomNavigation activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
  },
  filterButtonActive: {
    backgroundColor: colors.background.tertiary,
  },
  filterText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  filterTextActive: {
    color: colors.text.primary,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  tableHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeaderText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  sortIcon: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
  },
  list: {
    flex: 1,
  },
  walletContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  walletInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  walletAddress: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  logoutButton: {
    padding: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
  },
});
