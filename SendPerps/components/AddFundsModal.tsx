import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { Keypad } from "./Keypad";
import { haptics } from "../utils/haptics";

interface AddFundsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (amount: string, mode: "swap" | "transfer") => void;
  spotBalance: number;
  usolBalance: number;
  mode: "swap" | "transfer";
  onModeChange: (mode: "swap" | "transfer") => void;
}

export const AddFundsModal: React.FC<AddFundsModalProps> = ({
  visible,
  onClose,
  onConfirm,
  spotBalance,
  usolBalance,
  mode,
  onModeChange,
}) => {
  const [transferAmount, setTransferAmount] = useState("0");
  const [solAmount, setSolAmount] = useState("0.1");

  const handleKeyPress = (key: string) => {
    const setter = mode === "swap" ? setSolAmount : setTransferAmount;
    const current = mode === "swap" ? solAmount : transferAmount;
    
    if (key === "backspace") {
      setter((prev) =>
        prev.length > 1 ? prev.slice(0, -1) : "0"
      );
    } else if (key === ".") {
      if (!current.includes(".")) {
        setter((prev) =>
          prev === "0" ? "0." : prev + "."
        );
      }
    } else {
      setter((prev) => {
        const newValue = prev === "0" ? key : prev + key;
        const numValue = parseFloat(newValue);
        // For swap mode, no max check; for transfer, check spot balance
        if (mode === "transfer" && numValue > spotBalance) {
          return prev;
        }
        return newValue;
      });
    }
  };

  const handleConfirm = () => {
    const amount = mode === "swap" ? solAmount : transferAmount;
    onConfirm(amount, mode);
  };

  const isConfirmDisabled = () => {
    if (mode === "swap") {
      return parseFloat(solAmount) <= 0 || parseFloat(solAmount) > usolBalance;
    } else {
      // Allow transfer even if no USDC - we'll auto-swap USOL if needed
      return parseFloat(transferAmount) <= 0;
    }
  };

  const renderModeToggle = () => (
    <View style={styles.modeToggleContainer}>
      <TouchableOpacity
        style={[
          styles.modeToggleButton,
          mode === "transfer" && styles.modeToggleButtonActive,
        ]}
        onPress={() => {
          haptics.selection();
          onModeChange("transfer");
        }}
      >
        <Text
          style={[
            styles.modeToggleText,
            mode === "transfer" && styles.modeToggleTextActive,
          ]}
        >
          Transfer USDC
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.modeToggleButton,
          mode === "swap" && styles.modeToggleButtonActive,
        ]}
        onPress={() => {
          haptics.selection();
          onModeChange("swap");
        }}
      >
        <Text
          style={[
            styles.modeToggleText,
            mode === "swap" && styles.modeToggleTextActive,
          ]}
        >
          Swap USOL
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Funds</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {renderModeToggle()}

        <View style={styles.modalContent}>
          {mode === "swap" ? (
            <>
              <Text style={styles.availableLabel}>Available USOL</Text>
              <Text style={styles.availableAmount}>
                {usolBalance.toFixed(6)} USOL
              </Text>
              <Text style={styles.helperText}>
                Will swap to USDC and transfer to perp
              </Text>

              <Text style={styles.transferLabel}>USOL Amount to Swap</Text>
              <Text style={styles.transferAmount}>{solAmount} USOL</Text>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.maxButton}
                  onPress={() => setSolAmount(usolBalance.toFixed(6))}
                >
                  <Text style={styles.maxButtonText}>Max</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.availableLabel}>Available Balances</Text>
              <Text style={styles.availableAmount}>
                USDC: ${spotBalance.toFixed(2)}
              </Text>
              <Text style={styles.helperText}>
                USOL: {usolBalance.toFixed(6)} (will auto-swap if needed)
              </Text>

              <Text style={styles.transferLabel}>Amount to Transfer</Text>
              <Text style={styles.transferAmount}>${transferAmount}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.maxButton}
                  onPress={() => setTransferAmount(spotBalance.toFixed(2))}
                >
                  <Text style={styles.maxButtonText}>Max USDC</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <Keypad onKeyPress={handleKeyPress} />

          <TouchableOpacity
            style={[
              styles.confirmButton,
              isConfirmDisabled() && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={isConfirmDisabled()}
          >
            <Text style={styles.confirmButtonText}>
              {mode === "swap" 
                ? `Swap ${solAmount} USOL → Perp`
                : spotBalance >= parseFloat(transferAmount)
                  ? `Transfer $${transferAmount} USDC → Perp`
                  : `Auto-swap USOL → $${transferAmount} → Perp`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = {
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  modeToggleContainer: {
    flexDirection: 'row' as const,
    margin: 20,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 4,
  },
  modeToggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center' as const,
    borderRadius: 8,
  },
  modeToggleButtonActive: {
    backgroundColor: colors.accent.purple,
  },
  modeToggleText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text.secondary,
  },
  modeToggleTextActive: {
    color: colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  availableLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  availableAmount: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  transferLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  transferAmount: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    marginBottom: 32,
  },
  maxButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  maxButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text.accent,
  },
  confirmButton: {
    backgroundColor: colors.accent.purple,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    marginTop: 'auto' as const,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.background.secondary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
};