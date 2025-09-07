import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { router } from "expo-router";
import { fontSize } from "@/constants/spacing";

interface Position {
  position: {
    coin: string;
    cumFunding: {
      allTime: string;
      sinceChange: string;
      sinceOpen: string;
    };
    entryPx: string;
    leverage: {
      rawUsd: string;
      type: "isolated" | "cross";
      value: number;
    };
    liquidationPx: string;
    marginUsed: string;
    maxLeverage: number;
    positionValue: string;
    returnOnEquity: string;
    szi: string;
    unrealizedPnl: string;
  };
  type: string;
}

interface AccountSummary {
  assetPositions: Position[];
  marginSummary: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };
  withdrawable: string;
}

interface RecentActivitySectionProps {
  accountSummary: AccountSummary | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function RecentActivitySection({
  accountSummary,
  isLoading,
  error,
  onRefresh,
}: RecentActivitySectionProps) {
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPnL = (pnl: string) => {
    const num = parseFloat(pnl);
    const isPositive = num >= 0;
    return {
      value: `${isPositive ? "+" : ""}$${Math.abs(num).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      color: isPositive ? colors.accent.green : colors.accent.red,
    };
  };

  const renderPosition = ({ item }: { item: Position }) => {
    const { position } = item;
    const pnl = formatPnL(position.unrealizedPnl);
    const isLong = parseFloat(position.szi) > 0;

    return (
      <TouchableOpacity
        style={styles.positionItem}
        onPress={() => {
          router.push({
            pathname: "/trading",
            params: {
              symbol: position.coin,
              name: position.coin,
            },
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.positionHeader}>
          <View style={styles.positionInfo}>
            <Text style={styles.positionCoin}>{position.coin}</Text>
            <View
              style={[
                styles.positionTypeIndicator,
                {
                  backgroundColor: isLong
                    ? colors.accent.green
                    : colors.accent.red,
                },
              ]}
            >
              <Text style={styles.positionTypeText}>
                {isLong ? "LONG" : "SHORT"} {position.leverage.value}x
              </Text>
            </View>
          </View>
          <Text style={[styles.pnlValue, { color: pnl.color }]}>
            {pnl.value}
          </Text>
        </View>

        <View style={styles.positionDetails}>
          <View style={styles.positionDetailItem}>
            <Text style={styles.positionDetailLabel}>Entry</Text>
            <Text style={styles.positionDetailValue}>
              ${formatCurrency(position.entryPx)}
            </Text>
          </View>
          <View style={styles.positionDetailItem}>
            <Text style={styles.positionDetailLabel}>Size</Text>
            <Text style={styles.positionDetailValue}>
              {Math.abs(parseFloat(position.szi)).toFixed(4)}
            </Text>
          </View>
          <View style={styles.positionDetailItem}>
            <Text style={styles.positionDetailLabel}>Value</Text>
            <Text style={styles.positionDetailValue}>
              ${formatCurrency(position.positionValue)}
            </Text>
          </View>
          <View style={styles.positionDetailItem}>
            <Text style={styles.positionDetailLabel}>Liq. Price</Text>
            <Text style={styles.positionDetailValue}>
              ${formatCurrency(position.liquidationPx)}
            </Text>
          </View>
        </View>

        <View style={styles.positionFooter}>
          <Text style={styles.marginUsed}>
            Margin: ${formatCurrency(position.marginUsed)}
          </Text>
          <View style={styles.leverageInfo}>
            <Text style={styles.leverageText}>
              {position.leverage.type.toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Positions & Activity</Text>
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
        <Text style={styles.sectionTitle}>Positions & Activity</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons
            name="refresh-outline"
            size={20}
            color={colors.text.accent}
          />
        </TouchableOpacity>
      </View>

      {isLoading &&
      (!accountSummary || accountSummary.assetPositions.length === 0) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.text.accent} />
          <Text style={styles.loadingText}>Loading positions...</Text>
        </View>
      ) : !accountSummary || accountSummary.assetPositions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="bar-chart-outline"
            size={48}
            color={colors.text.secondary}
          />
          <Text style={styles.emptyText}>No active positions</Text>
          <Text style={styles.emptySubtext}>
            Your trading activity will appear here
          </Text>
        </View>
      ) : (
        <>
          {/* Account Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Account Value</Text>
              <Text style={styles.summaryValue}>
                ${formatCurrency(accountSummary.marginSummary.accountValue)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Margin Used</Text>
              <Text style={styles.summaryValue}>
                ${formatCurrency(accountSummary.marginSummary.totalMarginUsed)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Available to Withdraw</Text>
              <Text style={styles.summaryValue}>
                ${formatCurrency(accountSummary.withdrawable)}
              </Text>
            </View>
          </View>

          {/* Positions List */}
          <FlatList
            data={accountSummary.assetPositions}
            renderItem={renderPosition}
            keyExtractor={(item, index) => `${item.position.coin}-${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>
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
  summaryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 8,
  },
  summaryLabel: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "500" as const,
  },
  positionItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  positionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  positionInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  positionCoin: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginRight: 8,
  },
  positionTypeIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  positionTypeText: {
    color: colors.text.primary,
    fontSize: 10,
    fontWeight: "600" as const,
  },
  pnlValue: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  positionDetails: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 12,
  },
  positionDetailItem: {
    alignItems: "center" as const,
    flex: 1,
  },
  positionDetailLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  positionDetailValue: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "500" as const,
  },
  positionFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  marginUsed: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  leverageInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  leverageText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: "500" as const,
  },
};
