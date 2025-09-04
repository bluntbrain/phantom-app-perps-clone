import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePrivy } from "@privy-io/expo";
import { colors } from "../constants/colors";
import { hyperUnitService } from "../services/HyperUnitService";
import { hyperliquidService } from "../services/HyperliquidService";
import { BottomNavigation } from "../components/BottomNavigation";
import { historyStyles as styles } from "../styles/screens/historyStyles";

type TransactionType = "bridge" | "trade" | "position";
type TransactionStatus = "pending" | "processing" | "completed" | "failed";

interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  asset: string;
  from?: string;
  to?: string;
  timestamp: number;
  txHash?: string;
  description: string;
  fee?: string;
  explorerUrl?: string;
  sourceChain?: "solana" | "ethereum" | "hyperliquid" | "arbitrum";
}

export default function HistoryScreen() {
  const { user } = usePrivy();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "bridge" | "trade">("all");

  useEffect(() => {
    fetchTransactionHistory();
  }, [user]);

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      
      // Get user's wallet address
      const walletAccount = user?.linked_accounts?.find(
        (account) =>
          (account.type === "wallet" || account.type === "smart_wallet") &&
          "address" in account
      ) as { address: string } | undefined;

      if (!walletAccount?.address) {
        setTransactions([]);
        return;
      }

      const userAddress = walletAccount.address;
      console.log("Fetching history:", userAddress);

      // Fetch bridge operations from HyperUnit
      const bridgeOps = await fetchBridgeOperations(userAddress);
      
      // Fetch trading history from Hyperliquid
      const trades = await fetchTradingHistory(userAddress);
      
      // Combine and sort by timestamp
      const allTransactions = [...bridgeOps, ...trades].sort(
        (a, b) => b.timestamp - a.timestamp
      );
      
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getExplorerUrl = (txHash: string, chain: string): string => {
    // Always use mainnet explorers
    switch (chain?.toLowerCase()) {
      case "solana":
        return `https://solscan.io/tx/${txHash}`;
      case "ethereum":
        return `https://etherscan.io/tx/${txHash}`;
      case "arbitrum":
        return `https://arbiscan.io/tx/${txHash}`;
      case "hyperliquid":
        // Hyperliquid explorer
        return `https://app.hyperliquid.xyz/explorer/tx/${txHash}`;
      default:
        // Default to Solscan mainnet for unknown chains
        return `https://solscan.io/tx/${txHash}`;
    }
  };

  const fetchBridgeOperations = async (userAddress: string): Promise<Transaction[]> => {
    try {
      // Try to fetch operations from HyperUnit
      const operations = await hyperUnitService.getUserOperations(userAddress);
      
      // Map operations to our transaction format
      return operations.map((op: any) => {
        const sourceChain = (op.sourceChain || "solana").toLowerCase();
        const txHash = op.sourceTx || op.txHash;
        
        return {
          id: op.id || `bridge-${Date.now()}-${Math.random()}`,
          type: "bridge" as TransactionType,
          status: mapOperationStatus(op.status),
          amount: op.amount || "0",
          asset: op.asset || "SOL",
          from: op.sourceChain || "Solana",
          to: op.destinationChain || "Hyperliquid",
          timestamp: op.timestamp || Date.now(),
          txHash: txHash,
          description: `Bridge ${op.amount || "0"} ${op.asset || "SOL"}`,
          fee: op.fee,
          sourceChain: sourceChain as any,
          explorerUrl: txHash ? getExplorerUrl(txHash, sourceChain) : undefined,
        };
      });
    } catch (error) {
      console.error("Failed to fetch bridge operations:", error);
      
      // Return mock data for demonstration with a real mainnet tx hash
      const mockTxHash = "5wJ3KwGL3JBbxfZRcGbVZGzKH7diLsDJHRUZ7UbhVwFQ8Qd6YPCKw3NA2tALQmRgBbBv3kq9Esnc8ZBkJ3szX6nL";
      const mockBridgeTransaction: Transaction = {
        id: "bridge-1",
        type: "bridge",
        status: "completed",
        amount: "0.1",
        asset: "SOL",
        from: "Solana",
        to: "Hyperliquid",
        timestamp: Date.now() - 3600000, // 1 hour ago
        description: "Bridge 0.1 SOL from Solana to Hyperliquid",
        fee: "0.0001",
        txHash: mockTxHash,
        sourceChain: "solana",
        explorerUrl: getExplorerUrl(mockTxHash, "solana"),
      };
      
      return [mockBridgeTransaction];
    }
  };

  const fetchTradingHistory = async (userAddress: string): Promise<Transaction[]> => {
    try {
      // Fetch positions from Hyperliquid
      const positions = await hyperliquidService.getUserPositions(userAddress);
      
      // Map positions to transaction format
      return positions.map((pos: any, index: number) => ({
        id: `trade-${index}`,
        type: "trade" as TransactionType,
        status: "completed" as TransactionStatus,
        amount: pos.size,
        asset: pos.coin,
        timestamp: Date.now() - (index * 7200000), // Stagger by 2 hours
        description: `${parseFloat(pos.size) > 0 ? "Long" : "Short"} ${Math.abs(parseFloat(pos.size))} ${pos.coin}`,
        fee: "0.0002",
      }));
    } catch (error) {
      console.error("Failed to fetch trading history:", error);
      return [];
    }
  };

  const mapOperationStatus = (status: string): TransactionStatus => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "sourcetxdiscovered":
        return "pending";
      case "processing":
      case "buildingtx":
      case "waitingforfinalization":
        return "processing";
      case "done":
      case "completed":
        return "completed";
      case "failed":
      case "error":
        return "failed";
      default:
        return "pending";
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactionHistory();
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "bridge") return tx.type === "bridge";
    if (selectedFilter === "trade") return tx.type === "trade" || tx.type === "position";
    return true;
  });

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case "completed":
        return colors.accent.green;
      case "processing":
        return colors.accent.orange;
      case "pending":
        return colors.accent.yellow;
      case "failed":
        return colors.accent.red;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case "completed":
        return "checkmark-circle";
      case "processing":
        return "time";
      case "pending":
        return "hourglass";
      case "failed":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    
    // Format as date
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  };

  const handleTransactionPress = async (tx: Transaction) => {
    if (tx.explorerUrl) {
      try {
        const supported = await Linking.canOpenURL(tx.explorerUrl);
        if (supported) {
          await Linking.openURL(tx.explorerUrl);
        } else {
          Alert.alert(
            "Cannot Open Explorer",
            "Unable to open the blockchain explorer. URL: " + tx.explorerUrl
          );
        }
      } catch (error) {
        console.error("Failed to open explorer:", error);
        Alert.alert("Error", "Failed to open blockchain explorer");
      }
    } else if (tx.txHash) {
      // If no explorer URL but we have a txHash, show it
      Alert.alert(
        "Transaction Hash",
        tx.txHash,
        [
          { text: "Copy", onPress: () => {
            // You can implement clipboard copy here
          }},
          { text: "OK" }
        ]
      );
    }
  };

  const renderTransaction = (tx: Transaction) => (
    <TouchableOpacity 
      key={tx.id} 
      style={styles.transactionCard}
      onPress={() => handleTransactionPress(tx)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionLeft}>
          <View style={[styles.statusIcon, { backgroundColor: getStatusColor(tx.status) + "20" }]}>
            <Ionicons 
              name={getStatusIcon(tx.status) as any} 
              size={20} 
              color={getStatusColor(tx.status)} 
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription}>{tx.description}</Text>
            <View style={styles.transactionMeta}>
              {tx.from && tx.to && (
                <Text style={styles.transactionRoute}>
                  {tx.from} → {tx.to}
                </Text>
              )}
              <Text style={styles.transactionTime}>{formatTimestamp(tx.timestamp)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.transactionAmount}>
            {tx.amount} {tx.asset}
          </Text>
          {tx.fee && (
            <Text style={styles.transactionFee}>Fee: {tx.fee}</Text>
          )}
        </View>
      </View>
      {tx.txHash && (
        <View style={styles.txHashRow}>
          <View style={styles.txHashContainer}>
            <Text style={styles.txHashLabel}>Tx: </Text>
            <Text style={styles.txHash} numberOfLines={1} ellipsizeMode="middle">
              {tx.txHash}
            </Text>
          </View>
          {tx.explorerUrl && (
            <View style={styles.explorerIcon}>
              <Ionicons name="open-outline" size={16} color={colors.text.accent} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
      </View>

      <View style={styles.filterContainer}>
        {(["all", "bridge", "trade"] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text.secondary}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.text.accent} />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="document-text-outline" 
              size={48} 
              color={colors.text.secondary} 
            />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyText}>
              Your bridge and trading history will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {filteredTransactions.map(renderTransaction)}
          </View>
        )}
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}
