import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Modal,
  SafeAreaView,
} from "react-native";
import { usePrivy } from "@privy-io/expo";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { hyperUnitService, FeeEstimate } from "../services/HyperUnitService";
import { colors } from "../constants/colors";
import { useWallet } from "../hooks";
import { solanaBridgeStyles as styles } from "../styles/components/solanaBridgeStyles";

interface SolanaBridgeProps {
  visible: boolean;
  amount: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type StepType = "confirm" | "sending" | "processing" | "complete";

// solana bridge modal component for hyperunit deposits
export const SolanaBridge: React.FC<SolanaBridgeProps> = ({
  visible,
  amount,
  onClose,
  onSuccess,
}) => {
  const { user } = usePrivy();
  const { address: walletAddress } = useWallet();
  const [depositAddress, setDepositAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<StepType>("confirm");
  const [txHash, setTxHash] = useState("");
  const [operationId, setOperationId] = useState<string>("");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [feeEstimates, setFeeEstimates] = useState<FeeEstimate | null>(null);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);

  useEffect(() => {
    if (visible) {
      // load fee estimates when modal opens
      const loadFees = async () => {
        try {
          const fees = await hyperUnitService.getFeeEstimates();
          setFeeEstimates(fees);
        } catch (error) {
          console.error("Failed to load fee estimates:", error);
        }
      };

      loadFees();

      // Reset state
      setStep("confirm");
      setDepositAddress("");
      setTxHash("");
      setOperationId("");
      setCheckingStatus(false);
    }
  }, [visible]); // Only depend on visible

  const calculateFees = () => {
    const amountNum = parseFloat(amount) || 0;

    // get actual network fee from hyperunit api
    let networkFee = 0.000008; // default solana fee
    if (feeEstimates?.solana?.['solana-depositFee']) {
      // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
      const lamports = feeEstimates.solana['solana-depositFee'];
      networkFee = lamports / 1_000_000_000; // Convert to SOL
    }

    // hyperunit only charges network fees
    // no additional deposit fees
    const depositFee = networkFee;

    // Total fees
    const totalFees = depositFee;

    // Amount user will receive after fees
    const amountAfterFee = amountNum - totalFees;

    return {
      amount: amountNum.toFixed(6),
      depositFee: depositFee.toFixed(6),
      networkFee: networkFee.toFixed(6),
      totalFees: totalFees.toFixed(6),
      amountAfterFee:
        amountAfterFee > 0 ? amountAfterFee.toFixed(6) : "0.000000",
      eta: feeEstimates?.solana?.['solana-depositEta'] || "~1 min",
    };
  };

  const getHyperliquidAddress = (): string => {
    // use privy wallet address as destination
    return walletAddress || "";
  };

  const validateAmount = (): boolean => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return false;
    }

    if (amountNum < 0.1) {
      Alert.alert("Amount Too Low", "Minimum deposit is 0.1 SOL");
      return false;
    }

    const fees = calculateFees();
    if (parseFloat(fees.amountAfterFee) <= 0) {
      Alert.alert(
        "Insufficient Amount",
        "Amount is too low after fees. Please increase the amount."
      );
      return false;
    }

    return true;
  };

  const initiateBridge = async () => {
    if (!validateAmount()) return;

    const hyperliquidAddress = getHyperliquidAddress();
    if (!hyperliquidAddress) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      // generate hyperunit deposit address for sol to hyperliquid
      const bridgeData = await hyperUnitService.generateDepositAddress(
        "solana",
        "sol",
        hyperliquidAddress
      );

      setDepositAddress(bridgeData.address);
      setStep("sending");

      // The user needs to manually send from their wallet
      // We'll provide instructions and the deposit address
    } catch (error) {
      console.error("Failed to generate deposit address:", error);
      Alert.alert("Error", "Failed to initialize bridge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = async () => {
    if (!depositAddress) return;

    try {
      await Clipboard.setStringAsync(depositAddress);
      Alert.alert("Copied", "Deposit address copied to clipboard");
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const openWallet = () => {
    // Open the user's Solana wallet app to send the transaction
    // This will vary based on the wallet they have
    Alert.alert(
      "Send SOL",
      `Send exactly ${amount} SOL to the deposit address:\n\n${depositAddress}\n\nThe address has been copied to your clipboard.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Copy Address & Continue",
          onPress: async () => {
            await copyAddress();
            // You can add deep linking to specific wallets here if needed
          },
        },
      ]
    );
  };

  const handleTransactionSubmit = async () => {
    if (!depositAddress) {
      Alert.alert("Error", "Please generate a deposit address first.");
      return;
    }

    // Validate transaction hash if provided
    if (txHash && !hyperUnitService.isValidSolanaTxHash(txHash)) {
      Alert.alert(
        "Invalid Transaction Hash",
        "The transaction hash format is invalid. Please check and try again."
      );
      return;
    }

    setStep("processing");
    setCheckingStatus(true);

    try {
      const hyperliquidAddress = getHyperliquidAddress();
      if (!hyperliquidAddress) {
        throw new Error("No Hyperliquid address found");
      }

      // Store the transaction hash for reference
      if (txHash) {
        console.log("Transaction submitted with hash:", txHash);
        console.log(
          "Explorer URL:",
          hyperUnitService.getSolanaExplorerUrl(txHash)
        );
      }

      // Poll for operations
      let operationFound = false;
      let pollAttempts = 0;
      const maxAttempts = 12; // Check for 1 minute (12 * 5 seconds)

      const checkForOperation = async (): Promise<void> => {
        pollAttempts++;

        const operations = await hyperUnitService.getUserOperations(
          hyperliquidAddress
        );
        console.log(
          `Checking operations (attempt ${pollAttempts}):`,
          operations.length,
          "operations found"
        );

        // Find a recent deposit operation
        const recentOp = operations.find((op: any) => {
          // Check if this is a recent SOL deposit
          const isRecent =
            op.createdAt &&
            Date.now() - new Date(op.createdAt).getTime() < 600000; // Within 10 minutes

          return op.type === "deposit" && op.asset === "sol" && isRecent;
        });

        if (recentOp) {
          setOperationId(recentOp.id);
          console.log("Found operation:", recentOp);
          operationFound = true;

          // If operation is already done, complete immediately
          if (recentOp.status === "Done" || recentOp.status === "done") {
            setStep("complete");
            setCheckingStatus(false);
            return;
          }

          // Otherwise, poll for completion
          try {
            await hyperUnitService.pollOperationStatus(
              recentOp.id,
              (status: any) => {
                console.log("Operation status update:", status);
              },
              24, // maxAttempts: 24 * 5000ms = 120000ms (2 minutes)
              5000 // intervalMs: 5 seconds
            );
            setStep("complete");
          } catch (pollError) {
            console.log("Polling completed or timed out:", pollError);
            setStep("complete");
          }
        } else if (pollAttempts < maxAttempts) {
          // Wait and try again
          await new Promise((resolve) => setTimeout(resolve, 5000));
          await checkForOperation();
        } else {
          // No operation found after polling
          console.log("No operation found after polling");
          setStep("complete");
        }
      };

      await checkForOperation();
    } catch (error) {
      console.error("Error checking transaction:", error);
      Alert.alert(
        "Transaction Submitted",
        "Your transaction has been submitted. Funds will appear in your Hyperliquid account within 1-2 minutes.",
        [{ text: "OK", onPress: () => setStep("complete") }]
      );
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleComplete = () => {
    onSuccess?.();
    onClose();
  };

  const renderConfirmation = () => {
    const fees = calculateFees();

    return (
      <ScrollView style={styles.content}>
        <View style={styles.titleSection}>
          <View>
            <Text style={styles.title}>Confirm Bridge Details</Text>
            <Text style={styles.subtitle}>
              Bridge SOL from your wallet to Hyperliquid
            </Text>
          </View>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.cardLabel}>Amount to Bridge</Text>
          <Text style={styles.amountValue}>{fees.amount} SOL</Text>
        </View>

        <View style={styles.feeCard}>
          <Text style={styles.cardLabel}>Fee Breakdown</Text>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Amount to Send:</Text>
            <Text style={styles.feeValue}>{fees.amount} SOL</Text>
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Network Fee:</Text>
            <Text style={[styles.feeValue, styles.feeDeduction]}>
              -{fees.networkFee} SOL
            </Text>
          </View>

          <View style={[styles.feeRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>You&apos;ll Receive:</Text>
            <Text style={styles.totalValue}>{fees.amountAfterFee} SOL</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.text.secondary}
          />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>Processing time: {fees.eta}</Text>
            <Text style={styles.infoText}>
              Funds will be available on Hyperliquid after confirmation
            </Text>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.accent.orange}
          />
          <Text style={styles.warningText}>
            You&apos;re bridging on Mainnet. This transaction involves real funds.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={initiateBridge}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.text.primary} />
          ) : (
            <Text style={styles.primaryButtonText}>Continue to Send</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderSending = () => {
    const fees = calculateFees();

    return (
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Send SOL from Your Wallet</Text>
        <Text style={styles.subtitle}>
          Use your Solana wallet to send the transaction
        </Text>

        <TouchableOpacity 
          style={styles.instructionCard}
          onPress={() => setInstructionsExpanded(!instructionsExpanded)}
          activeOpacity={0.7}
        >
          <View style={{
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Text style={styles.instructionTitle}>How to Bridge:</Text>
            <Ionicons 
              name={instructionsExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.text.primary} 
            />
          </View>
          
          {instructionsExpanded && (
            <>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>1.</Text>
                <Text style={styles.stepText}>Copy the deposit address below</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>2.</Text>
                <Text style={styles.stepText}>
                  Open your Solana wallet (Phantom, Solflare, etc.)
                </Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>3.</Text>
                <Text style={styles.stepText}>
                  Send exactly {fees.amount} SOL to the address
                </Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>4.</Text>
                <Text style={styles.stepText}>
                  Copy the transaction hash from your wallet
                </Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>5.</Text>
                <Text style={styles.stepText}>Paste it below and confirm</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>HyperUnit Deposit Address</Text>
          <Text style={styles.address} numberOfLines={2}>
            {depositAddress}
          </Text>
          <TouchableOpacity style={styles.copyButton} onPress={copyAddress}>
            <Ionicons
              name="copy-outline"
              size={20}
              color={colors.text.accent}
            />
            <Text style={styles.copyText}>Copy Address</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.text.secondary}
          />
          <Text style={styles.infoText}>
            Your funds will be available on Hyperliquid after ~30 confirmations
            (about 1 minute)
          </Text>
        </View>

        <View style={styles.amountReminderCard}>
          <Text style={styles.reminderLabel}>Send Exactly:</Text>
          <Text style={styles.reminderAmount}>{fees.amount} SOL</Text>
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="warning" size={24} color={colors.accent.orange} />
          <Text style={styles.warningText}>
            Only send SOL from Solana Mainnet. Sending other tokens or using
            wrong network will result in permanent loss.
          </Text>
        </View>

        <View style={styles.txInputContainer}>
          <Text style={styles.txInputLabel}>
            Transaction Hash (Recommended)
          </Text>
          <TextInput
            style={styles.txInput}
            value={txHash}
            onChangeText={setTxHash}
            placeholder="Paste your Solana transaction hash here"
            placeholderTextColor={colors.text.secondary}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.txInputHint}>
            Providing the transaction hash helps us track your deposit faster
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !txHash && styles.buttonDisabled]}
          onPress={handleTransactionSubmit}
          disabled={!txHash && !depositAddress}
        >
          <Text style={styles.primaryButtonText}>
            {txHash ? "Confirm Transaction" : "I've Sent the Transaction"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setStep("confirm")}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderProcessing = () => (
    <View style={styles.centerContent}>
      <ActivityIndicator size="large" color={colors.accent.purple} />
      <Text style={styles.processingTitle}>Processing Bridge</Text>
      <Text style={styles.processingSubtitle}>
        Your transaction is being processed. This typically takes 1-2 minutes.
      </Text>
      {txHash && (
        <View style={styles.txHashContainer}>
          <Text style={styles.txHashLabel}>Transaction Hash:</Text>
          <Text style={styles.txHashValue} numberOfLines={1}>
            {txHash.slice(0, 8)}...{txHash.slice(-8)}
          </Text>
        </View>
      )}
      {operationId && (
        <View style={styles.operationContainer}>
          <Text style={styles.operationLabel}>Bridge Operation ID:</Text>
          <Text style={styles.operationValue}>{operationId}</Text>
        </View>
      )}
      <Text style={styles.processingHint}>
        Funds will appear in your Hyperliquid account after ~30 confirmations.
      </Text>
    </View>
  );

  const renderComplete = () => {
    const fees = calculateFees();

    return (
      <View style={styles.centerContent}>
        <View style={styles.successIcon}>
          <Ionicons
            name="checkmark-circle"
            size={64}
            color={colors.accent.green}
          />
        </View>
        <Text style={styles.successTitle}>Bridge Initiated!</Text>
        <Text style={styles.successSubtitle}>
          {fees.amountAfterFee} SOL is being bridged to Hyperliquid.
        </Text>
        {txHash && (
          <View style={styles.txInfoCard}>
            <Text style={styles.txInfoLabel}>Transaction Hash:</Text>
            <Text style={styles.txInfoValue} numberOfLines={2}>
              {txHash}
            </Text>
          </View>
        )}
        <Text style={styles.successHint}>
          Your funds will be available on Hyperliquid in 1-2 minutes.
        </Text>
        <Text style={styles.successNote}>
          You can now close this window and start trading once the funds arrive.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleComplete}>
          <Text style={styles.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bridge to Hyperliquid</Text>
          <View style={styles.headerRight}>
            <View style={styles.networkBadge}>
              <Text style={styles.networkBadgeText}>Mainnet</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {step === "confirm" && renderConfirmation()}
        {step === "sending" && renderSending()}
        {step === "processing" && renderProcessing()}
        {step === "complete" && renderComplete()}
      </SafeAreaView>
    </Modal>
  );
};
