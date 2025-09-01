import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { usePrivy } from "@privy-io/expo";
import * as Clipboard from "expo-clipboard";
import {
  hyperUnitService,
  FeeEstimate,
  BridgeAddress,
} from "../services/HyperUnitService";
import { colors } from "../constants/colors";
import { spacing, fontSize, borderRadius } from "../constants/spacing";
import { Ionicons } from "@expo/vector-icons";

interface BridgeComponentProps {
  onClose: () => void;
}

export const BridgeComponent: React.FC<BridgeComponentProps> = ({
  onClose,
}) => {
  const { user } = usePrivy();
  const [selectedAsset, setSelectedAsset] = useState<"btc" | "eth" | "sol">(
    "eth"
  );
  const [amount, setAmount] = useState("");
  const [bridgeAddress, setBridgeAddress] = useState<BridgeAddress | null>(
    null
  );
  const [feeEstimates, setFeeEstimates] = useState<FeeEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "address" | "completed">("input");

  useEffect(() => {
    const loadFees = async () => {
      try {
        const fees = await hyperUnitService.getFeeEstimates();
        setFeeEstimates(fees);
      } catch (error) {
        console.error("Failed to load fee estimates:", error);
      }
    };

    loadFees();
  }, []);

  const getWalletAddress = () => {
    const walletAccount = user?.linked_accounts?.find(
      (account) =>
        (account.type === "wallet" || account.type === "smart_wallet") &&
        "address" in account
    ) as { address: string } | undefined;

    return walletAccount?.address || "";
  };

  const handleGenerateAddress = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const walletAddress = getWalletAddress();
    if (!walletAddress) {
      Alert.alert("Error", "No wallet connected");
      return;
    }

    setLoading(true);
    try {
      const sourceChain = getSourceChain(selectedAsset);
      const depositAddress = await hyperUnitService.generateDepositAddress(
        sourceChain,
        selectedAsset,
        walletAddress
      );

      setBridgeAddress(depositAddress);
      setStep("address");
    } catch (error) {
      console.error("Failed to generate bridge address:", error);
      Alert.alert(
        "Error",
        "Failed to generate deposit address. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getSourceChain = (
    asset: "btc" | "eth" | "sol"
  ): "bitcoin" | "solana" | "ethereum" => {
    switch (asset) {
      case "btc":
        return "bitcoin";
      case "eth":
        return "ethereum";
      case "sol":
        return "solana";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert("Address Copied", "Deposit address copied to clipboard");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      Alert.alert("Copy Failed", "Unable to copy address to clipboard");
    }
  };

  const getCurrentFee = () => {
    if (!feeEstimates) return null;

    switch (selectedAsset) {
      case "btc":
        return feeEstimates.bitcoin;
      case "eth":
        return feeEstimates.ethereum;
      case "sol":
        return feeEstimates.solana;
    }
  };

  const renderInputStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Bridge to Hyperliquid</Text>
      <Text style={styles.subtitle}>
        Bridge your assets to start trading on Hyperliquid
      </Text>

      <View style={styles.assetSelector}>
        {(["btc", "eth", "sol"] as const).map((asset) => (
          <TouchableOpacity
            key={asset}
            style={[
              styles.assetButton,
              selectedAsset === asset && styles.assetButtonActive,
            ]}
            onPress={() => setSelectedAsset(asset)}
          >
            <Text
              style={[
                styles.assetButtonText,
                selectedAsset === asset && styles.assetButtonTextActive,
              ]}
            >
              {asset.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount to bridge</Text>
        <TextInput
          style={styles.textInput}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={colors.text.secondary}
          keyboardType="numeric"
        />
        <Text style={styles.minAmount}>
          Minimum: {hyperUnitService.getMinimumDeposit(selectedAsset)}
        </Text>
      </View>

      {getCurrentFee() && (
        <View style={styles.feeContainer}>
          <Text style={styles.feeLabel}>Bridge Fee</Text>
          <Text style={styles.feeAmount}>
            {hyperUnitService.formatFee(
              getCurrentFee()!.depositFee,
              selectedAsset
            )}
          </Text>
          <Text style={styles.feeEta}>ETA: {getCurrentFee()!.depositEta}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGenerateAddress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.text.primary} />
        ) : (
          <Text style={styles.buttonText}>Generate Deposit Address</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderAddressStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Deposit Address Generated</Text>
      <Text style={styles.subtitle}>
        Send {amount} {selectedAsset.toUpperCase()} to the address below
      </Text>

      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Deposit Address</Text>
        <View style={styles.addressRow}>
          <Text style={styles.addressText} numberOfLines={1}>
            {bridgeAddress?.address}
          </Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(bridgeAddress?.address || "")}
          >
            <Ionicons name="copy" size={16} color={colors.text.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.warningContainer}>
        <Ionicons name="warning" size={20} color={colors.accent.orange} />
        <Text style={styles.warningText}>
          Only send {selectedAsset.toUpperCase()} to this address. Sending other
          assets will result in permanent loss.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setStep("completed")}
      >
        <Text style={styles.buttonText}>I've Sent the Transaction</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setStep("input")}
      >
        <Text style={styles.secondaryButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCompletedStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successContainer}>
        <Ionicons
          name="checkmark-circle"
          size={48}
          color={colors.accent.green}
        />
        <Text style={styles.successTitle}>Transaction Submitted</Text>
        <Text style={styles.successSubtitle}>
          Your bridge transaction is being processed. Funds will appear in your
          Hyperliquid account shortly.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onClose}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {step === "input" && renderInputStep()}
      {step === "address" && renderAddressStep()}
      {step === "completed" && renderCompletedStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    marginBottom: spacing.xl,
  },
  assetSelector: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  assetButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  assetButtonActive: {
    backgroundColor: colors.accent.purple,
  },
  assetButtonText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  assetButtonTextActive: {
    color: colors.text.primary,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  label: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  minAmount: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  feeContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  feeLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  feeAmount: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  feeEta: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  button: {
    backgroundColor: colors.accent.purple,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  addressContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  addressLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  addressText: {
    flex: 1,
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontFamily: "monospace",
  },
  copyButton: {
    padding: spacing.xs,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  warningText: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginBottom: spacing.xl,
  },
  successTitle: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    textAlign: "center",
    lineHeight: 22,
  },
});
