import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { useWalletSigning } from "../hooks/useWalletSigning";
import { fontSize } from "@/constants/spacing";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

interface Order {
  coin: string;
  isPositionTpsl: boolean;
  isTrigger: boolean;
  limitPx: string;
  oid: number;
  orderType: string;
  origSz: string;
  reduceOnly: boolean;
  side: "A" | "B";
  sz: string;
  timestamp: number;
  triggerCondition: string;
  triggerPx: string;
}

interface OrdersSectionProps {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function OrdersSection({
  orders,
  isLoading,
  error,
  onRefresh,
}: OrdersSectionProps) {
  const {
    signAndCancelOrder,
    signAndModifyOrder,
    signAndUpdateLeverage,
    isReady,
  } = useWalletSigning();

  const handleCancelOrder = async (order: Order) => {
    if (!isReady) {
      Alert.alert("Wallet Not Ready", "Please wait for wallet initialization.");
      return;
    }

    Alert.alert(
      "Cancel Order",
      `Are you sure you want to cancel this ${
        order.side === "A" ? "buy" : "sell"
      } order for ${order.coin}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: async () => {
            try {
              // need asset index for cancel
              const { hyperliquidService } = await import(
                "../services/HyperliquidService"
              );
              const meta = await hyperliquidService.getMeta();
              const assetIndex = meta.universe.findIndex(
                (asset: any) => asset.name === order.coin
              );

              if (assetIndex === -1) {
                throw new Error(`Asset ${order.coin} not found`);
              }

              const result = await signAndCancelOrder(assetIndex, order.oid);

              if (result.status === "ok") {
                Toast.show({
                  type: "success",
                  text1: "Order Cancelled",
                  text2: `${order.side === "A" ? "Buy" : "Sell"} order for ${
                    order.coin
                  } cancelled successfully`,
                  visibilityTime: 3000,
                });
                onRefresh();
              } else {
                throw new Error(result.response || "Cancel failed");
              }
            } catch (error) {
              console.error("cancel order failed:", error);
              Toast.show({
                type: "error",
                text1: "Cancel Failed",
                text2: "Failed to cancel order. Please try again.",
                visibilityTime: 4000,
              });
            }
          },
        },
      ]
    );
  };

  const handleModifyOrder = (order: Order) => {
    // Navigate to trading screen for the specific coin to modify the order
    router.push({
      pathname: "/trading",
      params: {
        symbol: `${order.coin}-USD`,
        name: order.coin,
        modifyOrderId: order.oid.toString(),
        modifyOrderPrice: order.limitPx,
        modifyOrderSize: order.sz,
        modifyOrderSide: order.side === "A" ? "buy" : "sell",
      },
    });
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderCoin}>{item.coin}</Text>
          <View
            style={[
              styles.sideIndicator,
              {
                backgroundColor:
                  item.side === "A" ? colors.accent.green : colors.accent.red,
              },
            ]}
          >
            <Text style={styles.sideText}>
              {item.side === "A" ? "BUY" : "SELL"}
            </Text>
          </View>
        </View>
        <Text style={styles.orderTime}>{formatTime(item.timestamp)}</Text>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderDetailItem}>
          <Text style={styles.orderDetailLabel}>Price</Text>
          <Text style={styles.orderDetailValue}>
            ${formatPrice(item.limitPx)}
          </Text>
        </View>
        <View style={styles.orderDetailItem}>
          <Text style={styles.orderDetailLabel}>Size</Text>
          <Text style={styles.orderDetailValue}>{item.sz}</Text>
        </View>
        <View style={styles.orderDetailItem}>
          <Text style={styles.orderDetailLabel}>Type</Text>
          <Text style={styles.orderDetailValue}>{item.orderType}</Text>
        </View>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.modifyButton]}
          onPress={() => handleModifyOrder(item)}
        >
          <Ionicons
            name="create-outline"
            size={16}
            color={colors.text.primary}
          />
          <Text style={styles.actionButtonText}>Modify</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => handleCancelOrder(item)}
        >
          <Ionicons name="close-outline" size={16} color={colors.text.black} />
          <Text style={[styles.actionButtonText, { color: colors.text.black }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Open Orders</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons
              name="refresh-outline"
              size={20}
              color={colors.text.accent}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Open Orders</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons
            name="refresh-outline"
            size={20}
            color={colors.text.accent}
          />
        </TouchableOpacity>
      </View>

      {isLoading && orders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.text.accent} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-outline"
            size={48}
            color={colors.text.secondary}
          />
          <Text style={styles.emptyText}>No open orders</Text>
          <Text style={styles.emptySubtext}>
            Your active orders will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.oid.toString()}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = {
  container: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  loadingContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: colors.text.secondary,
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center" as const,
  },
  errorText: {
    color: colors.accent.red,
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.accent,
    fontSize: 14,
    fontWeight: "500" as const,
  },
  emptyContainer: {
    alignItems: "center" as const,
    paddingVertical: 32,
  },
  emptyText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "500" as const,
    marginTop: 12,
  },
  emptySubtext: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 4,
  },
  orderItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  orderCoin: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginRight: 8,
  },
  sideIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sideText: {
    color: colors.text.primary,
    fontSize: 10,
    fontWeight: "600" as const,
  },
  orderTime: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  orderDetails: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 16,
  },
  orderDetailItem: {
    alignItems: "center" as const,
  },
  orderDetailLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  orderDetailValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "500" as const,
  },
  orderActions: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  modifyButton: {
    backgroundColor: colors.background.tertiary,
  },
  cancelButton: {
    backgroundColor: colors.accent.purple,
  },
  actionButtonText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "500" as const,
    marginLeft: 4,
  },
};
