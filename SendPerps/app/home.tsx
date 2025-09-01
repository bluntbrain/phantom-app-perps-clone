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
import { hyperliquidService, PerpsData } from "../services/HyperliquidService";

export default function HomeScreen() {
  const { user, logout, isReady } = usePrivy();
  const [selectedFilter, setSelectedFilter] = useState<"Volume" | "24h">(
    "Volume"
  );
  const [perpsData, setPerpsData] = useState<PerpsData[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // load real Hyperliquid data when user connects
  React.useEffect(() => {
    const loadRealData = async () => {
      console.log("[HomeScreen] loadRealData called, user:", !!user);

      if (user) {
        console.log("[HomeScreen] User found, starting data load...");
        console.log(
          "[HomeScreen] User linked accounts:",
          user.linked_accounts?.length
        );

        setLoadingData(true);
        try {
          // get wallet address from linked accounts
          const walletAccount = user.linked_accounts?.find(
            (account) =>
              (account.type === "wallet" || account.type === "smart_wallet") &&
              "address" in account
          ) as { address: string; wallet_client_type?: string } | undefined;

          console.log(
            "[HomeScreen] Wallet account found:",
            !!walletAccount?.address
          );
          console.log(
            "[HomeScreen] Wallet address:",
            walletAccount?.address?.substring(0, 10) + "..."
          );

          if (walletAccount?.address) {
            // initialize wallet with Privy
            const embeddedWallet = user.linked_accounts?.find(
              (account) =>
                account.type === "wallet" &&
                account.wallet_client_type === "privy"
            );

            console.log(
              "[HomeScreen] Embedded wallet found:",
              !!embeddedWallet
            );
            console.log("[HomeScreen] Initializing HyperliquidService...");

            hyperliquidService.initializeWallet(walletAccount.address);

            console.log("[HomeScreen] Fetching real perps data...");
            // load real perps data
            const realPerpsData = await hyperliquidService.getPerpsData();
            console.log("[HomeScreen] Real perps data received:", {
              length: realPerpsData.length,
              firstItem: realPerpsData[0]?.symbol,
            });

            if (realPerpsData.length > 0) {
              console.log("[HomeScreen] Setting real perps data to state");
              setPerpsData(realPerpsData);
            } else {
              console.log("[HomeScreen] No real perps data, keeping mock data");
            }
          } else {
            console.log("[HomeScreen] No wallet address found");
          }
        } catch (error) {
          console.error("[HomeScreen] Failed to load real data:", error);
          console.error("[HomeScreen] Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack:
              error instanceof Error
                ? error.stack?.substring(0, 200)
                : undefined,
          });
        } finally {
          console.log("[HomeScreen] Setting loadingData to false");
          setLoadingData(false);
        }
      } else {
        console.log("[HomeScreen] No user found, skipping data load");
      }
    };

    loadRealData();
  }, [user]);

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
      iconUrl={item.iconUrl}
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

      {loadingData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.text.accent} />
          <Text style={styles.loadingText}>Loading perps data...</Text>
        </View>
      ) : (
        <FlatList
          data={perpsData}
          renderItem={renderPerpsItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
});
