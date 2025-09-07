import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { revieworderStyles as styles } from "../styles/screens/revieworderStyles";
import { useWalletSigning } from "../hooks/useWalletSigning";
import { hyperliquidService } from "../services/HyperliquidService";

export default function ReviewOrderScreen() {
  const {
    symbol,
    isLong,
    amount,
    leverage,
    leveragedSize,
    currentPrice,
    isAddToPosition = "false",
    isReducePosition = "false",
  } = useLocalSearchParams();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { isReady: signingReady, signAndPlaceOrder } = useWalletSigning();

  const handleBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const handleOpenPosition = async () => {
    if (!signingReady) {
      Alert.alert("Wallet Not Ready", "Please wait for wallet initialization.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPlacingOrder(true);

    try {
      // get asset index from hyperliquid metadata
      const meta = await hyperliquidService.getMeta();
      const coin = (symbol as string).replace("-USD", "");
      const assetIndex = meta.universe.findIndex(
        (asset: any) => asset.name === coin
      );

      if (assetIndex === -1) {
        throw new Error(`Asset ${coin} not found`);
      }

      const price = parseFloat(currentPrice as string) || 0;
      const amountNum = parseFloat(amount as string) || 0;
      const leverageNum = parseInt(leverage as string) || 1;
      const isLongPosition = isLong === "true";

      // calculate size based on amount and price - this is the position size in base asset (BTC, ETH, etc.)
      const positionSize = (amountNum * leverageNum) / price;

      // get asset metadata to determine proper size formatting
      const assetMeta = meta.universe[assetIndex];
      const szDecimals = assetMeta.szDecimals || 5;

      // format size to proper decimals and ensure minimum order value ($10)
      const formattedSize = positionSize.toFixed(szDecimals);
      const orderValue = positionSize * price;

      if (orderValue < 10) {
        throw new Error(
          `Order value $${orderValue.toFixed(
            2
          )} is below minimum $10 requirement`
        );
      }

      console.log(
        `[Order] ${coin} size calculation: $${amountNum} * ${leverageNum}x / $${price.toLocaleString()} = ${formattedSize} ${coin} (value: $${orderValue.toFixed(
          2
        )})`
      );

      const size = formattedSize;

      // get exact current market price from hyperliquid sdk
      const priceData = await hyperliquidService.getCurrentPrice(
        symbol as string
      );
      const currentMarketPrice = priceData.price;

      // check if provided price is within acceptable range (5% of market price)
      const priceDiff =
        Math.abs(price - currentMarketPrice) / currentMarketPrice;
      const useMarketOrder = priceDiff > 0.05; // if more than 5% away, use market order

      console.log(
        `[Order] ${coin} - Input: $${price.toLocaleString()}, Market: $${currentMarketPrice.toLocaleString()}, Diff: ${(
          priceDiff * 100
        ).toFixed(2)}%, Using ${useMarketOrder ? "market" : "limit"} order`
      );

      const isReduceMode = isReducePosition === "true";

      const orderType = useMarketOrder
        ? ("market" as const)
        : ("limit" as const);

      // round prices to proper tick size
      const tickSize = 0.1;
      const roundedPrice = Math.round(price / tickSize) * tickSize;
      const roundedMarketPrice =
        Math.round(currentMarketPrice / tickSize) * tickSize;

      const orderParams = {
        coin,
        isBuy: isLongPosition,
        size: size.toString(),
        price: useMarketOrder
          ? roundedMarketPrice.toFixed(1)
          : roundedPrice.toFixed(1),
        orderType,
        reduceOnly: isReduceMode, // set reduce-only for reduce position mode
        postOnly: false,
      };

      console.log("placing order:", orderParams);

      const result = await signAndPlaceOrder(orderParams);

      if (result.status === "ok") {
        const isAddMode = isAddToPosition === "true";
        const isReduceMode = isReducePosition === "true";

        let successTitle = "Order Placed";
        let successMessage = "";
        if (isAddMode) {
          successTitle = "Position Added";
          successMessage = `Added to your ${
            isLongPosition ? "long" : "short"
          } position for ${coin}`;
        } else if (isReduceMode) {
          successTitle = "Position Reduced";
          successMessage = `Reduced your position for ${coin}`;
        } else {
          successMessage = `${useMarketOrder ? "Market" : "Limit"} ${
            isLongPosition ? "long" : "short"
          } order placed for ${coin}`;
        }

        Toast.show({
          type: "success",
          text1: successTitle,
          text2: successMessage,
          visibilityTime: 3000,
        });

        // navigate back after a short delay to show the toast
        setTimeout(() => {
          router.replace("/home");
        }, 1000);
      } else {
        throw new Error(result.response || "Order failed");
      }
    } catch (error) {
      console.error("order placement failed:", error);

      Toast.show({
        type: "error",
        text1: "Order Failed",
        text2:
          error instanceof Error
            ? error.message
            : "Failed to place order. Please try again.",
        visibilityTime: 4000,
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const price = parseFloat(currentPrice as string) || 4460.1;
  const amountNum = parseFloat(amount as string) || 0;
  const isLongPosition = isLong === "true";

  const ethAmount = amountNum / price;
  const liquidationPrice = isLongPosition
    ? price * 0.975 // 2.5% below for long
    : price * 1.025; // 2.5% above for short

  const getCryptoColor = () => {
    if (typeof symbol === "string") {
      if (symbol.includes("ETH")) return colors.crypto.ethereum;
      if (symbol.includes("BTC")) return colors.crypto.bitcoin;
      if (symbol.includes("SOL")) return colors.crypto.solana;
      if (symbol.includes("XRP")) return colors.crypto.ripple;
    }
    return colors.crypto.others;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background.primary}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Order</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Position Summary */}
        <View style={styles.positionCard}>
          <View style={styles.positionHeader}>
            <View
              style={[styles.cryptoIcon, { backgroundColor: getCryptoColor() }]}
            >
              <View style={styles.iconPlaceholder} />
            </View>
            <View style={styles.positionInfo}>
              <Text style={styles.positionTitle}>
                {symbol} {isLongPosition ? "Long" : "Short"}
              </Text>
              <Text style={styles.positionAmount}>${amount}</Text>
            </View>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.detailsCard}>
          {/* Leverage */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Leverage</Text>
            <Text style={styles.detailValue}>{leverage}x</Text>
          </View>

          {/* Size */}
          <View style={styles.detailRow}>
            <View style={styles.labelWithIcon}>
              <Text style={styles.detailLabel}>Size</Text>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.text.secondary}
              />
            </View>
            <View style={styles.sizeValue}>
              <Text style={styles.detailValue}>${leveragedSize}</Text>
              <Text style={styles.ethAmount}>
                {ethAmount.toFixed(4)} {symbol?.toString().replace("-USD", "")}
              </Text>
            </View>
          </View>

          {/* Fee */}
          <View style={styles.detailRow}>
            <View style={styles.labelWithIcon}>
              <Text style={styles.detailLabel}>Fee</Text>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.text.secondary}
              />
            </View>
            <Text style={styles.detailValue}>0.0932%</Text>
          </View>
        </View>

        {/* Price Information */}
        <View style={styles.priceCard}>
          {/* Current Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{symbol} Price</Text>
            <Text style={styles.priceValue}>${price.toLocaleString()}</Text>
          </View>

          {/* Liquidation Price */}
          <View style={styles.priceRow}>
            <View style={styles.labelWithIcon}>
              <Text style={styles.priceLabel}>Liquidation Price</Text>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.text.secondary}
              />
            </View>
            <Text style={styles.liquidationPrice}>
              ${liquidationPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Risk Disclosure */}
        <View style={styles.riskDisclosure}>
          <Text style={styles.riskText}>
            Trading perpetual contracts involves significant risk, including the
            potential for sudden and total loss of your investment and
            collateral due to high leverage and market volatility, and may not
            be suitable for all users. Prices may be influenced by funding rates
            and liquidity and you may be subject to automatic liquidations
            without notice. Market data provided by Hyperliquid.
          </Text>
        </View>
      </ScrollView>

      {/* Open Position Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.openButton, isPlacingOrder && { opacity: 0.6 }]}
          onPress={handleOpenPosition}
          disabled={isPlacingOrder}
          activeOpacity={0.8}
        >
          {isPlacingOrder ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ActivityIndicator
                size="small"
                color={colors.text.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.openButtonText}>Placing Order...</Text>
            </View>
          ) : (
            <Text style={styles.openButtonText}>
              Open {isLongPosition ? "Long" : "Short"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
