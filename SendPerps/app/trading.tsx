import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { colors } from "../constants/colors";
import { spacing, fontSize, borderRadius } from "../constants/spacing";
import { haptics } from "../utils/haptics";
import * as Haptics from "expo-haptics";
import { AdvancedTradingChart } from "../components/AdvancedTradingChart";
import { TimePeriodSelector } from "../components/TimePeriodSelector";
import { BottomNavigation } from "../components/BottomNavigation";
import { Ionicons } from "@expo/vector-icons";

export default function TradingScreen() {
  // safe parameter extraction with error handling
  let params;
  let symbol = "ETH-USD";
  let name = "Ethereum";

  try {
    params = useLocalSearchParams();
    symbol =
      params?.symbol && typeof params.symbol === "string"
        ? params.symbol
        : "ETH-USD";
    name =
      params?.name && typeof params.name === "string"
        ? params.name
        : "Ethereum";
  } catch (error) {
    console.error("[TradingScreen] Error getting params:", error);
  }

  const [currentPrice, setCurrentPrice] = useState(100.0);
  const [change, setChange] = useState(1.5);
  const [changePercent, setChangePercent] = useState(1.5);
  const [availableBalance, setAvailableBalance] = useState(1250.0);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [hasError, setHasError] = useState(false);

  // static data loading with error handling
  useEffect(() => {
    try {
      console.log(
        "[TradingScreen] Loading trading screen for symbol:",
        symbol,
        "name:",
        name
      );

      //  set static data, no dynamic logic to prevent crashes
      setCurrentPrice(100.0);
      setChange(1.5);
      setChangePercent(1.5);
      setAvailableBalance(1250.0);
      setLoadingPrice(false);
      setHasError(false);

      console.log("[TradingScreen] Successfully loaded static data for", name);
    } catch (error) {
      console.error("[TradingScreen] Critical error in useEffect:", error);
      // fallback - set everything to safe defaults
      try {
        setCurrentPrice(100.0);
        setChange(0.0);
        setChangePercent(0.0);
        setAvailableBalance(1000.0);
        setLoadingPrice(false);
        setHasError(true);
      } catch (innerError) {
        console.error("[TradingScreen] Critical inner error:", innerError);
      }
    }
  }, [symbol, name]);

  const handleBackPress = () => {
    try {
      haptics.light();
      router.back();
    } catch (error) {
      console.error("[TradingScreen] Error in handleBackPress:", error);
      try {
        router.back();
      } catch (innerError) {
        console.error("[TradingScreen] Critical error going back:", innerError);
      }
    }
  };

  const handleLongPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: "/longshort",
        params: {
          symbol: symbol || "ETH-USD",
          name: name || "Ethereum",
          isLong: "true",
          autoCloseEnabled: "false",
        },
      });
    } catch (error) {
      console.error("[TradingScreen] Error in handleLongPress:", error);
    }
  };

  const handleShortPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: "/longshort",
        params: {
          symbol: symbol || "ETH-USD",
          name: name || "Ethereum",
          isLong: "false",
          autoCloseEnabled: "false",
        },
      });
    } catch (error) {
      console.error("[TradingScreen] Error in handleShortPress:", error);
    }
  };

  const handlePeriodChange = (period: string) => {
    try {
      haptics.selection();
      console.log(`Time period changed to: ${period}`);
    } catch (error) {
      console.error("[TradingScreen] Error in handlePeriodChange:", error);
    }
  };

  const handleAddFunds = () => {
    try {
      haptics.light();
      router.push("/addfunds");
    } catch (error) {
      console.error("[TradingScreen] Error in handleAddFunds:", error);
    }
  };

  // error state
  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.symbolText}>ETH-USD</Text>
              <Text style={styles.typeText}>Ethereum • Perp</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trading screen...</Text>
        </View>
        <BottomNavigation />
      </SafeAreaView>
    );
  }

  try {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.symbolText}>{symbol}</Text>
              <Text style={styles.typeText}>{name} • Perp</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AdvancedTradingChart
            symbol={symbol as string}
            currentPrice={loadingPrice ? 0 : currentPrice}
            change={change}
            changePercent={changePercent}
          />

          <TimePeriodSelector onPeriodChange={handlePeriodChange} />

          <View style={styles.balanceSection}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Available to trade</Text>
              <View style={styles.balanceRight}>
                {loadingPrice ? (
                  <ActivityIndicator size="small" color={colors.text.accent} />
                ) : (
                  <Text style={styles.balanceAmount}>
                    ${availableBalance.toFixed(2)}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddFunds}
                >
                  <Ionicons name="add" size={16} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoText}>Info</Text>
          </View>
        </ScrollView>

        <View style={styles.fixedButtonContainer}>
          <View style={styles.tradingButtons}>
            <TouchableOpacity
              style={[styles.tradingButton, styles.longButton]}
              onPress={handleLongPress}
            >
              <Text style={styles.tradingButtonText}>Long</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tradingButton, styles.shortButton]}
              onPress={handleShortPress}
            >
              <Text style={styles.tradingButtonText}>Short</Text>
            </TouchableOpacity>
          </View>
        </View>

        <BottomNavigation />
      </SafeAreaView>
    );
  } catch (renderError) {
    console.error("[TradingScreen] Critical render error:", renderError);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cryptoIcon: {
    marginRight: spacing.sm,
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
  },
  headerText: {
    alignItems: "flex-start",
  },
  symbolText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  typeText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  fixedButtonContainer: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    paddingTop: spacing.sm,
  },
  balanceSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
  balanceRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  balanceAmount: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  infoText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
  tradingButtons: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  tradingButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  longButton: {
    backgroundColor: colors.accent.purple,
  },
  shortButton: {
    backgroundColor: colors.accent.purple,
  },
  tradingButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: "600",
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
