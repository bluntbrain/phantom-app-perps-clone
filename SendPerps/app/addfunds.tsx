import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { spacing, fontSize, borderRadius } from "../constants/spacing";
import { haptics } from "../utils/haptics";
import { Keypad } from "../components/Keypad";

export default function AddFundsScreen() {
  const [amount, setAmount] = useState("25.45");
  const [usdcAmount, setUsdcAmount] = useState("24.06");

  const availableBalance = 102.11;
  const fee = 1.39;
  const minimumAmount = 30.0;

  const handleClose = () => {
    haptics.light();
    router.back();
  };

  const handleKeypadPress = (key: string) => {
    if (key === "backspace") {
      if (amount.length > 0) {
        const newAmount = amount.slice(0, -1);
        setAmount(newAmount || "0");
        const numericAmount = parseFloat(newAmount || "0");
        setUsdcAmount((numericAmount * 0.946).toFixed(2));
      }
    } else if (key === ".") {
      if (!amount.includes(".")) {
        const newAmount = amount + key;
        setAmount(newAmount);
        const numericAmount = parseFloat(newAmount);
        setUsdcAmount((numericAmount * 0.946).toFixed(2));
      }
    } else {
      if (amount === "0") {
        setAmount(key);
        const numericAmount = parseFloat(key);
        setUsdcAmount((numericAmount * 0.946).toFixed(2));
      } else {
        const newAmount = amount + key;
        setAmount(newAmount);
        const numericAmount = parseFloat(newAmount);
        setUsdcAmount((numericAmount * 0.946).toFixed(2));
      }
    }
  };

  const handleKeypadLongPress = (key: string) => {
    if (key === "backspace") {
      setAmount("0");
      setUsdcAmount("0.00");
    }
  };

  const handleAddFunds = () => {
    haptics.medium();
    console.log("Add funds pressed for amount:", amount);
    // TODO: Implement actual add funds functionality
  };

  const isAmountValid = parseFloat(amount) >= minimumAmount;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background.primary}
      />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Add Funds</Text>
      </View>

      <View style={styles.mainContent}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.amountSection}>
            <Text style={styles.amountText}>${amount}</Text>
            <Text style={styles.usdcText}>{usdcAmount} USDC</Text>
          </View>

          <View style={styles.paymentSection}>
            <View style={styles.paymentMethod}>
              <View style={styles.solanaIcon}>
                <View
                  style={[
                    styles.iconPlaceholder,
                    { backgroundColor: colors.crypto.solana },
                  ]}
                />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Pay SOL</Text>
              </View>
              <Text style={styles.availableText}>
                ${availableBalance.toFixed(2)} available
              </Text>
            </View>
          </View>

          {/* Fixed height container for warning to prevent layout shift */}
          <View style={styles.warningContainer}>
            {!isAmountValid && (
              <View style={styles.minimumSection}>
                <View style={[styles.minimumNotice, styles.minimumNoticeWarning]}>
                  <Text style={[styles.minimumText, styles.minimumTextWarning]}>
                    Minimum ${minimumAmount.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Fixed Keypad Section */}
        <View style={styles.keypadSection}>
          <Keypad
            onKeyPress={handleKeypadPress}
            onLongPress={handleKeypadLongPress}
            size="medium"
            buttonBackgroundColor={colors.background.secondary}
          />
        </View>

        {/* Fixed Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.feeSection}>
            <View style={styles.feeRow}>
              <Text style={styles.feeText}>${fee.toFixed(2)} fee</Text>
              <TouchableOpacity>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.addFundsButton,
              !isAmountValid && styles.addFundsButtonDisabled,
            ]}
            onPress={handleAddFunds}
            disabled={!isAmountValid}
            activeOpacity={0.8}
          >
            <Text style={styles.addFundsButtonText}>Add Funds • ${amount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  mainContent: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
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
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: "600",
    flex: 1,
    textAlign: "left",
  },
  amountSection: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
  },
  amountText: {
    color: colors.text.primary,
    fontSize: 64,
    fontWeight: "300",
    marginBottom: spacing.sm,
  },
  usdcText: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
  },
  paymentSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  solanaIcon: {
    marginRight: spacing.md,
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  availableText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  warningContainer: {
    minHeight: 60, // Fixed height to prevent layout shift
    justifyContent: 'center',
  },
  minimumSection: {
    paddingHorizontal: spacing.md,
  },
  minimumNotice: {
    backgroundColor: colors.accent.purple,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  minimumNoticeWarning: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  minimumText: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  minimumTextWarning: {
    color: colors.text.secondary,
  },
  keypadSection: {
    backgroundColor: colors.background.primary,
    paddingTop: spacing.sm,
  },
  bottomSection: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  feeSection: {
    alignItems: "center",
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  feeText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  addFundsButton: {
    backgroundColor: colors.accent.orange,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent.orange,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addFundsButtonDisabled: {
    backgroundColor: colors.background.secondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  addFundsButtonText: {
    color: colors.background.primary,
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
});
