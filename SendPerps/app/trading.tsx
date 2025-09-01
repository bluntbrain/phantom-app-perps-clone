import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { colors } from "../constants/colors";
import { spacing, fontSize, borderRadius } from "../constants/spacing";
import { haptics } from "../utils/haptics";
import * as Haptics from 'expo-haptics';
import { AdvancedTradingChart } from "../components/AdvancedTradingChart";
import { TimePeriodSelector } from "../components/TimePeriodSelector";
import { BottomNavigation } from "../components/BottomNavigation";
import { Ionicons } from "@expo/vector-icons";

export default function TradingScreen() {
  const { symbol = "ETH-USD", name = "Ethereum" } = useLocalSearchParams();

  const currentPrice = 4460.1;
  const change = 19.9;
  const changePercent = 0.45;
  const availableBalance = 0.0;

  const handleBackPress = () => {
    haptics.light();
    router.back();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/longshort',
      params: { 
        symbol: symbol as string, 
        isLong: 'true',
        autoCloseEnabled: 'false'
      },
    });
  };

  const handleShortPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/longshort',
      params: { 
        symbol: symbol as string, 
        isLong: 'false',
        autoCloseEnabled: 'false'
      },
    });
  };

  const handlePeriodChange = (period: string) => {
    haptics.selection();
    console.log(`Time period changed to: ${period}`);
  };

  const handleAddFunds = () => {
    haptics.light();
    router.push("/addfunds");
  };

  const getCryptoColor = () => {
    if (typeof symbol === "string") {
      if (symbol.includes("ETH")) return colors.crypto.ethereum;
      if (symbol.includes("BTC")) return colors.crypto.bitcoin;
      if (symbol.includes("SOL")) return colors.crypto.solana;
      if (symbol.includes("XRP")) return colors.crypto.ripple;
    }
    return colors.crypto.others;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.symbolText}>{symbol}</Text>
            <Text style={styles.typeText}>Perp</Text>
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
          currentPrice={currentPrice}
          change={change}
          changePercent={changePercent}
        />

        <TimePeriodSelector onPeriodChange={handlePeriodChange} />

        <View style={styles.balanceSection}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available to trade</Text>
            <View style={styles.balanceRight}>
              <Text style={styles.balanceAmount}>
                ${availableBalance.toFixed(2)}
              </Text>
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
});
