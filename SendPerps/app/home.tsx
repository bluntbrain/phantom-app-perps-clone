import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { usePrivy } from "@privy-io/expo";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "../components/LoginScreen";
import { colors } from "../constants/colors";
import { haptics } from "../utils/haptics";
import { PerpsCard } from "../components/PerpsCard";
import { BottomNavigation } from "../components/BottomNavigation";
import { hyperliquidService, PerpsData } from "../services/HyperliquidService";
import { homeStyles as styles } from "../styles/screens/homeStyles";
import { useWallet, useWalletBalance } from "../hooks";

export default function HomeScreen() {
  const { user, logout, isReady } = usePrivy();
  const { address, isConnected } = useWallet();
  const {
    balance,
    spotBalance,
    totalBalance,
    isLoading: balanceLoading,
  } = useWalletBalance();
  const [selectedFilter, setSelectedFilter] = useState<"Volume" | "24h">(
    "Volume"
  );
  const [perpsData, setPerpsData] = useState<PerpsData[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // load real Hyperliquid data when user connects
  React.useEffect(() => {
    const loadRealData = async () => {
      if (user) {
        console.log("[HomeScreen] Loading data:", {
          user: !!user,
          linkedAccounts: user.linked_accounts?.length || 0,
        });

        // Check wallet status
        console.log("[HomeScreen] Wallet status:", {
          linkedAccounts: user.linked_accounts?.map((a) => ({
            type: a.type,
            hasAddress: "address" in a,
            address: (a as any).address?.substring(0, 10),
          })),
          wallet: {
            isConnected,
            address: address?.substring(0, 10),
          },
        });

        setLoadingData(true);
        try {
          // Use wallet from linked accounts
          let walletAccount = user.linked_accounts?.find(
            (account) =>
              (account.type === "wallet" || account.type === "smart_wallet") &&
              "address" in account
          ) as { address: string; wallet_client_type?: string } | undefined;

          console.log("[HomeScreen] Wallet found:", {
            hasWallet: !!walletAccount?.address,
            address: walletAccount?.address?.substring(0, 10),
          });

          if (walletAccount?.address) {
            // Get perps data - no wallet initialization needed for read operations
            const embeddedWallet = user.linked_accounts?.find(
              (account) =>
                account.type === "wallet" &&
                account.wallet_client_type === "privy"
            );

            const realPerpsData = await hyperliquidService.getPerpsData();
            console.log("[HomeScreen] Perps data:", {
              embeddedWallet: !!embeddedWallet,
              dataLength: realPerpsData.length,
              firstSymbol: realPerpsData[0]?.symbol,
            });

            if (realPerpsData.length > 0) {
              setPerpsData(realPerpsData);
            } else {
              console.log("[HomeScreen] No perps data available");
            }
          } else {
            console.log("[HomeScreen] No wallet found");
          }
        } catch (error) {
          console.error("[HomeScreen] Data load failed:", {
            error: error instanceof Error ? error.message : error,
          });
        } finally {
          setLoadingData(false);
        }
      } else {
        console.log("[HomeScreen] No user found");
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
    if (address) {
      return address.slice(0, 6) + "..." + address.slice(-4);
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

      {/* Balance Display */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceRow}>
          {balanceLoading ? (
            <ActivityIndicator size="small" color={colors.text.accent} />
          ) : (
            <Text style={styles.balanceAmount}>
              $
              {totalBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          )}
        </View>
        {address && !balanceLoading && (
          <View style={styles.balanceBreakdown}>
            <Text style={styles.balanceSubtext}>
              Perps: ${balance.toFixed(2)} • Spot: ${spotBalance.toFixed(2)}
            </Text>
          </View>
        )}
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
          <Text style={styles.tableHeaderText}>Perps</Text>
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
