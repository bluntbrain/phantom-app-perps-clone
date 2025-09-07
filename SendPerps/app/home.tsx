import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { usePrivy } from "@privy-io/expo";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "../components/LoginScreen";
import { colors } from "../constants/colors";
import { haptics } from "../utils/haptics";
import { homeStyles as styles } from "../styles/screens/homeStyles";
import { BottomNavigation } from "../components/BottomNavigation";
import { useWallet, useWalletBalance } from "../hooks";
import { useWalletSigning } from "../hooks/useWalletSigning";
import { useHyperliquidPerpData } from "../hooks/useHyperliquidPerp";
import { OrdersSection } from "../components/OrdersSection";
import { RecentActivitySection } from "../components/RecentActivitySection";
import { fontSize } from "@/constants/spacing";

export default function HomeScreen() {
  const { user, logout, isReady } = usePrivy();
  const { address } = useWallet();
  const {
    balance,
    availableBalance,
    spotBalance,
    totalBalance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useWalletBalance();
  const {
    isReady: signingReady,
    signAndTransfer,
    error: signingError,
  } = useWalletSigning();

  // fetch user trading data
  const {
    accountSummary,
    openOrders,
    isLoading: perpDataLoading,
    hasError: perpDataError,
    refetchAll: refetchPerpData,
  } = useHyperliquidPerpData(address || undefined);

  // refresh state
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchBalance(), refetchPerpData()]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchBalance, refetchPerpData]);

  // show main loading screen only for initial app load
  if (
    !isReady ||
    (balanceLoading && perpDataLoading && !balance && !accountSummary.data)
  ) {
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

  // generate a consistent random avatar color based on wallet address
  const getAvatarColor = () => {
    if (!address) return colors.background.secondary;

    // generate a hash from the address
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      hash = address.charCodeAt(i) + ((hash << 5) - hash);
    }

    // create a color from the hash
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 50%)`;
  };

  // get initials for the avatar
  const getAvatarInitials = () => {
    if (address) {
      return address.slice(2, 4).toUpperCase(); // use first 2 chars after 0x
    }
    return "A1";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={[styles.avatar, { backgroundColor: getAvatarColor() }]}>
            <Text style={styles.avatarText}>{getAvatarInitials()}</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.walletAddress}>{getWalletAddress()}</Text>
            <Text style={styles.accountTitle}>Account 1</Text>
          </View>
        </View>
        <View style={styles.walletContainer}>
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
          <>
            <View style={styles.balanceBreakdown}>
              <Text style={styles.balanceSubtext}>
                Perps: ${balance.toFixed(2)} • Spot: ${spotBalance.toFixed(2)}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text.accent}
            colors={[colors.text.accent]}
          />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.sectionTitle}>Perps</Text>
            <Text
              onPress={() => router.push("/perp")}
              style={{
                color: colors.accent.purple,
                marginBottom: 8,
                fontSize: fontSize.md,
                fontWeight: "500",
              }}
            >
              Manage
            </Text>
          </View>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push("/perp")}
          >
            <Ionicons
              name="trending-up"
              size={24}
              color={colors.accent.purple}
            />
            <View>
              <Text style={styles.quickActionTitle}>Trade Perps</Text>
              <Text style={styles.quickActionSubtitle}>
                ${availableBalance.toFixed(2)} available
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Trading Data Sections - Only show if user has an address */}
        {address && (
          <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
            {/* Open Orders Section */}
            <OrdersSection
              orders={openOrders.data}
              isLoading={openOrders.isLoading}
              error={openOrders.error}
              onRefresh={refetchPerpData}
            />

            {/* Recent Activity / Positions Section */}
            <RecentActivitySection
              accountSummary={accountSummary.data}
              isLoading={accountSummary.isLoading}
              error={accountSummary.error}
              onRefresh={refetchPerpData}
            />
          </View>
        )}
      </ScrollView>

      <BottomNavigation activeTab="home" />
    </SafeAreaView>
  );
}
