import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { usePrivy } from "@privy-io/expo";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { haptics } from "../utils/haptics";
import { PerpsCard } from "../components/PerpsCard";
import { BottomNavigation } from "../components/BottomNavigation";
import { hyperliquidService, PerpsData } from "../services/HyperliquidService";
import { useWallet, useWalletBalance } from "../hooks";
import { useWalletSigning } from "../hooks/useWalletSigning";
import { AddFundsModal } from "../components/AddFundsModal";
import { perpStyles as styles } from "../styles/screens/perpStyles";

export default function PerpScreen() {
  const { user } = usePrivy();
  const { address } = useWallet();
  const {
    balance,
    usdcBalance,
    usolBalance,
    isLoading: balanceLoading,
  } = useWalletBalance();
  const {
    isReady: signingReady,
    signAndTransfer,
    signAndPlaceSpotOrder,
    error: signingError,
  } = useWalletSigning();

  const [perpsData, setPerpsData] = useState<PerpsData[]>([]);
  const [sortedPerpsData, setSortedPerpsData] = useState<PerpsData[]>([]);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // Start with descending
  const [loadingData, setLoadingData] = useState(false);
  const [addFundsVisible, setAddFundsVisible] = useState(false);
  const [addFundsMode, setAddFundsMode] = useState<"transfer" | "swap">(
    "transfer"
  );

  // helper function to parse volume string and convert to number for sorting
  const parseVolume = React.useCallback((volumeStr: string): number => {
    if (!volumeStr || volumeStr === "-" || volumeStr === "0") return 0;

    const numStr = volumeStr.replace(/[^0-9.]/g, ""); // Remove non-numeric chars except decimal
    const num = parseFloat(numStr);

    if (volumeStr.includes("K")) return num * 1000;
    if (volumeStr.includes("M")) return num * 1000000;
    if (volumeStr.includes("B")) return num * 1000000000;

    return num || 0;
  }, []);

  // sort perps data by volume
  const sortByVolume = React.useCallback(
    (data: PerpsData[], order: "desc" | "asc"): PerpsData[] => {
      return [...data].sort((a, b) => {
        const volumeA = parseVolume(a.volume);
        const volumeB = parseVolume(b.volume);

        if (order === "desc") {
          return volumeB - volumeA; // High to low
        } else {
          return volumeA - volumeB; // Low to high
        }
      });
    },
    [parseVolume]
  );

  React.useEffect(() => {
    const loadRealData = async () => {
      if (user) {
        setLoadingData(true);
        try {
          const realPerpsData = await hyperliquidService.getPerpsData();
          if (realPerpsData.length > 0) {
            setPerpsData(realPerpsData);
            // initially sort by volume descending
            const sorted = sortByVolume(realPerpsData, "desc");
            setSortedPerpsData(sorted);
          }
        } catch (error) {
          console.error("data load failed:", error);
        } finally {
          setLoadingData(false);
        }
      }
    };

    loadRealData();
  }, [user]);

  // re-sort when sort order changes
  React.useEffect(() => {
    if (perpsData.length > 0) {
      const sorted = sortByVolume(perpsData, sortOrder);
      setSortedPerpsData(sorted);
    }
  }, [perpsData, sortOrder]);

  const handleVolumeSortPress = () => {
    haptics.selection();
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const handlePerpsPress = (item: PerpsData) => {
    haptics.medium();
    router.push({
      pathname: "/trading",
      params: {
        symbol: item.symbol,
        name: item.name,
      },
    });
  };

  const handleAddFunds = () => {
    const hasUSDC = usdcBalance > 0;

    if (hasUSDC) {
      setAddFundsMode("transfer");
    } else {
      setAddFundsMode("swap");
    }

    setAddFundsVisible(true);
  };

  const handleWithdraw = () => {
    if (balance <= 0) {
      return;
    }
    // withdraw not implemented yet
  };

  const handleAddFundsConfirm = async (
    amount: string,
    mode: "transfer" | "swap"
  ) => {
    console.log("[handleAddFundsConfirm] ====================");
    console.log("[handleAddFundsConfirm] Starting confirmation process");
    console.log("[handleAddFundsConfirm] Amount:", amount, "Mode:", mode);
    console.log("[handleAddFundsConfirm] User Address:", address);
    console.log("[handleAddFundsConfirm] ====================");

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      console.error("[Validation Error] Invalid amount:", numAmount);
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount greater than 0"
      );
      return;
    }

    if (!signingReady) {
      console.error("[Wallet Error] Wallet not ready for signing");
      Alert.alert("Wallet Error", "Wallet is not ready. Please try again.");
      return;
    }

    if (signingError) {
      console.error("[Wallet Error] Signing error:", signingError);
      Alert.alert("Wallet Error", `Signing error: ${signingError}`);
      return;
    }

    if (!address) {
      console.error("[Address Error] No wallet address available");
      Alert.alert(
        "Address Error",
        "No wallet address available. Please connect your wallet."
      );
      return;
    }

    try {
      if (mode === "swap") {
        await performSwapAndTransfer(numAmount, "USOL", true);
      } else {
        try {
          await performDirectTransfer(numAmount);
        } catch (transferError) {
          if (
            transferError instanceof Error &&
            transferError.message.includes("Insufficient USDC")
          ) {
            const { hyperliquidService } = await import(
              "../services/HyperliquidService"
            );
            const spotBalances = await hyperliquidService.getSpotBalance(
              address || ""
            );
            const usolBalance = spotBalances.find(
              (balance) => balance.coin === "USOL"
            );
            const usolAmount = usolBalance ? parseFloat(usolBalance.total) : 0;

            if (usolAmount > 0) {
              await performSwapAndTransfer(usolAmount, "USOL", true);
            } else {
              throw new Error(
                "Insufficient balance: No USDC or USOL available for transfer"
              );
            }
          } else {
            throw transferError;
          }
        }
      }
    } catch (error) {
      console.error("add funds failed:", error);

      let userMessage = "Operation failed. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("Insufficient balance")) {
          userMessage =
            "Insufficient balance: You need USDC or USOL in your spot wallet.";
        } else if (error.message.includes("Swap failed")) {
          userMessage = "Swap operation failed. Please try again.";
        } else if (error.message.includes("Transfer failed")) {
          userMessage = "Transfer operation failed. Please check your balance.";
        }
      }

      Alert.alert("Operation Failed", userMessage);
    }
  };

  const performDirectTransfer = async (amount: number) => {
    try {
      haptics.medium();
      setAddFundsVisible(false);

      const result = await signAndTransfer(
        amount.toString(),
        true,
        address || undefined
      );

      if (result.status !== "ok") {
        throw new Error(
          result.response || `Transfer failed with status: ${result.status}`
        );
      }
    } catch (error) {
      console.error("direct transfer failed:", error);
      throw error;
    }
  };

  const performSwapAndTransfer = async (
    amount: number,
    _tokenSymbol: string,
    isDirectSolAmount: boolean = false
  ) => {
    try {
      haptics.medium();
      setAddFundsVisible(false);

      const swapSymbol = "USOL/USDC";

      const swapParams = {
        symbol: swapSymbol,
        isBuy: false,
        solAmount: isDirectSolAmount ? amount.toString() : undefined,
        usdValue: !isDirectSolAmount ? amount.toString() : undefined,
        slippageTolerance: 1.0,
      };

      const swapResult = await signAndPlaceSpotOrder(swapParams);

      if (swapResult.status !== "ok") {
        throw new Error(
          `Swap failed: ${swapResult.response || "Unknown error"}`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const { hyperliquidService } = await import(
        "../services/HyperliquidService"
      );
      const updatedBalances = await hyperliquidService.getSpotBalance(
        address || ""
      );

      const usdcBalance = updatedBalances.find((b) => b.coin === "USDC");
      const usdcAmount = usdcBalance ? parseFloat(usdcBalance.total) : 0;

      if (usdcAmount <= 0) {
        throw new Error(
          "No USDC available after swap. Please check the swap result."
        );
      }

      const transferResult = await signAndTransfer(
        usdcAmount.toString(),
        true,
        address || undefined
      );

      if (transferResult.status !== "ok") {
        throw new Error(
          `Transfer failed: ${transferResult.response || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("swap and transfer failed:", error);
      throw error;
    }
  };

  const renderPerpsItem = ({
    item,
    index,
  }: {
    item: PerpsData;
    index: number;
  }) => (
    <PerpsCard
      rank={index + 1}
      symbol={item.symbol}
      leverage={item.leverage}
      volume={item.volume}
      iconUrl={item.iconUrl}
      onPress={() => handlePerpsPress(item)}
    />
  );

  const handleAddFundsModeChange = (mode: "transfer" | "swap") => {
    setAddFundsMode(mode);
  };

  const handleBackPress = () => {
    haptics.light();
    router.push("/home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Perps</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Perp Balance Display */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceRow}>
          {balanceLoading ? (
            <ActivityIndicator size="small" color={colors.text.accent} />
          ) : (
            <Text style={styles.balanceAmount}>
              $
              {balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          )}
        </View>
        <Text style={styles.balanceLabel}>
          Available :{" "}
          {balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleWithdraw}
          >
            <Text
              style={[styles.actionButtonText, { color: colors.text.primary }]}
            >
              Withdraw
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.addFundsButton]}
            onPress={handleAddFunds}
          >
            <Text style={styles.actionButtonText}>Add Funds</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <View style={styles.tableHeaderLeft}>
          <Text style={styles.tableHeaderText}>#</Text>
          <Text style={[styles.tableHeaderText, { marginLeft: 62 }]}>
            Perps
          </Text>
        </View>
        <TouchableOpacity onPress={handleVolumeSortPress}>
          <Text style={styles.tableHeaderText}>
            Volume{"  "}
            <Text style={styles.sortIcon}>
              {sortOrder === "desc" ? "↓" : "↑"}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Perps List */}
      {loadingData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.text.accent} />
          <Text style={styles.loadingText}>Loading perps data...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedPerpsData}
          renderItem={renderPerpsItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AddFundsModal
        visible={addFundsVisible}
        onClose={() => setAddFundsVisible(false)}
        onConfirm={handleAddFundsConfirm}
        spotBalance={usdcBalance}
        usolBalance={usolBalance}
        mode={addFundsMode}
        onModeChange={handleAddFundsModeChange}
      />

      <BottomNavigation activeTab="perp" />
    </SafeAreaView>
  );
}
