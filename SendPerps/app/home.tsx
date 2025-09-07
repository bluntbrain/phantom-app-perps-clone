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
          <Text style={styles.sectionTitle}>Perps</Text>
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
