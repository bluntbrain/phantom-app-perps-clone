import React from "react";
import {
  View,
  Text,
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
import { homeStyles as styles } from "../styles/screens/homeStyles";
import { BottomNavigation } from "../components/BottomNavigation";
import { useWallet, useWalletBalance } from "../hooks";
import { useWalletSigning } from "../hooks/useWalletSigning";

export default function HomeScreen() {
  const { user, logout, isReady } = usePrivy();
  const { address } = useWallet();
  const {
    balance,
    spotBalance,
    totalBalance,
    isLoading: balanceLoading,
  } = useWalletBalance();
  const {
    isReady: signingReady,
    signAndTransfer,
    error: signingError,
  } = useWalletSigning();

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

  const _handleTransferToPerp = async () => {
    if (!spotBalance || spotBalance <= 0) {
      console.log("No funds available to transfer");
      return;
    }

    if (!signingReady) {
      console.log("Wallet not ready, please wait for wallet to initialize");
      return;
    }

    if (signingError) {
      console.log("Wallet error:", signingError);
      return;
    }

    try {
      haptics.medium();

      console.log("Initiating transfer to perp account");

      // Use Privy address for transfer (where the balance actually exists)
      // The signing will still use HyperUnit address internally
      const result = await signAndTransfer(
        spotBalance.toString(),
        true,
        address as string
      );

      if (result.status === "ok") {
        console.log(
          `Successfully transferred $${spotBalance.toFixed(2)} to perp account`
        );
      } else {
        throw new Error(result.response || "Transfer failed");
      }
    } catch (error) {
      console.error("Transfer error:", error);

      let errorMessage = "Could not complete the transfer";
      if (error instanceof Error) {
        if (error.message.includes("Must deposit before performing actions")) {
          errorMessage =
            "You need to make an initial deposit to Hyperliquid first. Bridge funds from Ethereum mainnet to activate your account, then you can transfer between spot and perp.";
        } else {
          errorMessage = error.message;
        }
      }

      console.error("Transfer failed:", errorMessage);
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

      {/* Content Wrapper with flex to push bottom nav down */}
      <View style={{ flex: 1 }}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push("/perp")}
          >
            <Ionicons name="trending-up" size={24} color={colors.accent.purple} />
            <Text style={styles.quickActionTitle}>Perpetuals</Text>
            <Text style={styles.quickActionSubtitle}>Trade with leverage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push("/addfunds")}
          >
            <Ionicons name="add-circle" size={24} color={colors.accent.green} />
            <Text style={styles.quickActionTitle}>Add Funds</Text>
            <Text style={styles.quickActionSubtitle}>Bridge from Solana</Text>
          </TouchableOpacity>
        </View>
        
        {/* Spacer to push navigation to bottom */}
        <View style={{ flex: 1 }} />
      </View>

      <BottomNavigation activeTab="home" />
    </SafeAreaView>
  );
}
