import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { colors } from "../constants/colors";
import { spacing, borderRadius, fontSize } from "../constants/spacing";
import { haptics } from "../utils/haptics";

interface PerpsCardProps {
  rank: number;
  symbol: string;
  leverage: string;
  volume: string;
  iconUrl?: string;
  onPress: () => void;
}

export const PerpsCard: React.FC<PerpsCardProps> = ({
  rank,
  symbol,
  leverage,
  volume,
  iconUrl,
  onPress,
}) => {
  const handlePress = () => {
    haptics.light();
    onPress();
  };

  const getRankStyle = () => {
    switch (rank) {
      case 1:
        return {
          backgroundColor: colors.ranking.first,
          color: colors.text.black,
        };
      case 2:
        return {
          backgroundColor: colors.ranking.second,
          color: colors.text.black,
        };
      case 3:
        return {
          backgroundColor: colors.ranking.third,
          color: colors.text.black,
        };
      default:
        return {};
    }
  };

  const getCryptoColor = () => {
    if (symbol.includes("ETH")) return colors.crypto.ethereum;
    if (symbol.includes("BTC")) return colors.crypto.bitcoin;
    if (symbol.includes("SOL")) return colors.crypto.solana;
    if (symbol.includes("XRP")) return colors.crypto.ripple;
    return colors.crypto.others;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.leftSection}>
        <View style={[styles.rankBadge, getRankStyle()]}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>

        <View style={styles.cryptoIcon}>
          {iconUrl ? (
            <View style={styles.iconBackground}>
              <Image source={{ uri: iconUrl }} style={styles.icon} />
            </View>
          ) : (
            <View
              style={[
                styles.iconPlaceholder,
                { backgroundColor: getCryptoColor() },
              ]}
            />
          )}
          <View style={styles.leverageIndicator}>
            <Text style={[styles.leverageText, { color: colors.text.black }]}>
              ∞
            </Text>
          </View>
        </View>

        <View style={styles.tokenInfo}>
          <Text style={styles.symbolText}>{symbol}</Text>
          <Text style={styles.leverageText}>{leverage}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.volumeText}>{volume}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  rankText: {
    fontSize: fontSize.sm,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  cryptoIcon: {
    position: "relative",
    marginRight: spacing.md,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
  },
  leverageIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    backgroundColor: colors.text.primary,
    borderRadius: borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  leverageText: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontWeight: "500",
  },
  tokenInfo: {
    flex: 1,
  },
  symbolText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: 2,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  volumeText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: "500",
  },
});
