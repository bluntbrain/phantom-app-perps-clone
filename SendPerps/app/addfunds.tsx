import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { haptics } from "../utils/haptics";
import { Keypad } from "../components/Keypad";
import { SolanaBridge } from "../components/SolanaBridge";
import { addfundsStyles as styles } from "../styles/screens/addfundsStyles";
import { useKeypadInput, useSolanaPrice, useFeeEstimation } from "../hooks";

export default function AddFundsScreen() {
  const [showBridge, setShowBridge] = useState(false);
  const minimumAmount = 0.2; // Minimum SOL to bridge (HyperUnit requirement)

  // Use custom hooks
  const {
    value: amount,
    handleKeyPress,
    handleLongPress,
  } = useKeypadInput("0.2");
  const { solPrice, loadingPrice, getUsdcValue } = useSolanaPrice();
  const { loadingFees, getFeeInfo } = useFeeEstimation(solPrice);

  const handleClose = () => {
    haptics.light();
    router.back();
  };

  const handleAddFunds = () => {
    haptics.medium();
    setShowBridge(true);
  };

  const handleBridgeSuccess = () => {
    // Refresh balance or navigate back
    router.back();
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
            <Text style={styles.amountLabel}>Amount to Bridge</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountText}>{amount}</Text>
              <Text style={styles.solText}>SOL</Text>
            </View>
            <View style={styles.usdcRow}>
              {loadingPrice ? (
                <ActivityIndicator size="small" color={colors.text.secondary} />
              ) : (
                <Text style={styles.usdcValue}>
                  ≈ ${getUsdcValue(amount)} USDC
                </Text>
              )}
              {!loadingPrice && solPrice > 0 && (
                <Text style={styles.solPriceText}>
                  (1 SOL = ${solPrice.toFixed(2)})
                </Text>
              )}
            </View>
          </View>

          {/* Fixed height container for warning to prevent layout shift */}
          <View style={styles.warningContainer}>
            {!isAmountValid && (
              <View style={styles.minimumSection}>
                <View
                  style={[styles.minimumNotice, styles.minimumNoticeWarning]}
                >
                  <Text style={[styles.minimumText, styles.minimumTextWarning]}>
                    Minimum {minimumAmount} SOL required
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Fixed Keypad Section */}
        <View style={styles.keypadSection}>
          <Keypad
            onKeyPress={handleKeyPress}
            onLongPress={handleLongPress}
            size="medium"
            buttonBackgroundColor={colors.background.secondary}
          />
        </View>

        {/* Fixed Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Fee Estimation Display */}
          <View style={styles.feeEstimateContainer}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Network Fee</Text>
              <View style={styles.feeValue}>
                {loadingFees ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.text.secondary}
                  />
                ) : (
                  <>
                    <Text style={styles.feeAmount}>
                      {getFeeInfo()?.fee || "0.000001 SOL"}
                    </Text>
                    {getFeeInfo()?.usd && (
                      <Text style={styles.feeUsd}>({getFeeInfo()?.usd})</Text>
                    )}
                  </>
                )}
              </View>
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
            <Text style={styles.addFundsButtonText}>
              Bridge {amount} SOL to Hyperliquid
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <SolanaBridge
        visible={showBridge}
        amount={amount}
        onClose={() => setShowBridge(false)}
        onSuccess={handleBridgeSuccess}
      />
    </SafeAreaView>
  );
}
