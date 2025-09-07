import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { colors } from "../constants/colors";
import { haptics } from "../utils/haptics";
import * as Haptics from "expo-haptics";
import { AdvancedTradingChart } from "../components/AdvancedTradingChart";
import { TimePeriodSelector } from "../components/TimePeriodSelector";
import { BottomNavigation } from "../components/BottomNavigation";
import { Ionicons } from "@expo/vector-icons";
import { hyperliquidService } from "../services/HyperliquidService";
import { tradingStyles as styles } from "../styles/screens/tradingStyles";
import {
  useWallet,
  useWalletBalance,
  useUserPerpAccountSummary,
} from "../hooks";
import { ModifyPositionBottomSheet } from "../components/ModifyPositionBottomSheet";
import { ClosePositionBottomSheet } from "../components/ClosePositionBottomSheet";

export default function TradingScreen() {
  // safe parameter extraction with error handling
  const params = useLocalSearchParams();
  const { address } = useWallet();
  const {
    balance,
    isLoading: loadingBalance,
    refetch: refetchBalance,
  } = useWalletBalance();

  let symbol = "ETH-USD";
  let name = "Ethereum";

  try {
    symbol =
      params?.symbol && typeof params.symbol === "string"
        ? params.symbol
        : "ETH-USD";
    name =
      params?.name && typeof params.name === "string"
        ? params.name
        : "Ethereum";
  } catch (error) {}

  const [currentPrice, setCurrentPrice] = useState(100.0);
  const [change, setChange] = useState(1.5);
  const [changePercent, setChangePercent] = useState(1.5);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<string>("1m");

  // position management state
  const [showModifySheet, setShowModifySheet] = useState(false);
  const [showCloseSheet, setShowCloseSheet] = useState(false);

  // refresh state
  const [refreshing, setRefreshing] = useState(false);

  // fetch user position data
  const { data: accountSummary, refetch: refetchAccountSummary } =
    useUserPerpAccountSummary(address as string);

  // check if user has open position for current symbol
  const currentPosition = accountSummary?.assetPositions?.find(
    (pos: any) => pos.position.coin === symbol.replace("-USD", "")
  );

  const hasPosition =
    currentPosition && parseFloat(currentPosition.position.szi) !== 0;
  const isLongPosition = currentPosition
    ? parseFloat(currentPosition.position.szi) > 0
    : false;

  // refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchBalance(),
        refetchAccountSummary(),
        // refresh price data
        (async () => {
          try {
            setLoadingPrice(true);
            const priceData = await hyperliquidService.getCurrentPrice(symbol);
            setCurrentPrice(priceData.price);
            setChange(priceData.change24h);
            setChangePercent(priceData.changePercent24h);
            setHasError(false);
          } catch (error) {
            console.error("failed to refresh price:", error);
            setHasError(true);
          } finally {
            setLoadingPrice(false);
          }
        })(),
      ]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchBalance, refetchAccountSummary, symbol]);

  // auto-refresh when screen comes into focus (e.g., after closing position)
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  // fetch exact real-time price using hyperliquid sdk only
  useEffect(() => {
    const fetchRealPrice = async () => {
      try {
        setLoadingPrice(true);
        setHasError(false);

        // get exact current price from hyperliquid sdk
        const priceData = await hyperliquidService.getCurrentPrice(symbol);

        setCurrentPrice(priceData.price);
        setChange(priceData.change24h);
        setChangePercent(priceData.changePercent24h);
        setLoadingPrice(false);
        setHasError(false);
      } catch (error) {
        console.error("failed to fetch real price from hyperliquid:", error);
        setLoadingPrice(false);
        setHasError(true);
        // do not set any fallback price - user will see error state
      }
    };

    fetchRealPrice();
  }, [symbol, name]);

  const handleBackPress = () => {
    try {
      haptics.light();
      router.back();
    } catch (error) {
      try {
        router.back();
      } catch (innerError) {}
    }
  };

  const handleLongPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: "/longshort",
        params: {
          symbol: symbol || "ETH-USD",
          name: name || "Ethereum",
          isLong: "true",
          autoCloseEnabled: "false",
          currentPrice: currentPrice.toString(),
        },
      });
    } catch (error) {}
  };

  const handleShortPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: "/longshort",
        params: {
          symbol: symbol || "ETH-USD",
          name: name || "Ethereum",
          isLong: "false",
          autoCloseEnabled: "false",
          currentPrice: currentPrice.toString(),
        },
      });
    } catch (error) {}
  };

  const handleModifyPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowModifySheet(true);
    } catch (error) {}
  };

  const handleClosePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowCloseSheet(true);
    } catch (error) {}
  };

  const handleAddToPosition = () => {
    try {
      setShowModifySheet(false);
      router.push({
        pathname: "/longshort",
        params: {
          symbol: symbol || "ETH-USD",
          name: name || "Ethereum",
          isLong: isLongPosition.toString(),
          autoCloseEnabled: "false",
          currentPrice: currentPrice.toString(),
          isAddToPosition: "true",
        },
      });
    } catch (error) {}
  };

  const handleReducePosition = () => {
    try {
      setShowModifySheet(false);
      router.push({
        pathname: "/longshort",
        params: {
          symbol: symbol || "ETH-USD",
          name: name || "Ethereum",
          isLong: (!isLongPosition).toString(), // opposite direction to reduce
          autoCloseEnabled: "false",
          currentPrice: currentPrice.toString(),
          isReducePosition: "true",
        },
      });
    } catch (error) {}
  };

  const handlePeriodChange = (period: string) => {
    try {
      haptics.selection();
      setSelectedInterval(period);
    } catch (error) {}
  };

  const handleAddFunds = () => {
    try {
      haptics.light();
      router.push("/addfunds");
    } catch (error) {}
  };

  // error state
  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.symbolText}>ETH-USD</Text>
              <Text style={styles.typeText}>Ethereum • Perp</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trading screen...</Text>
        </View>
        <BottomNavigation />
      </SafeAreaView>
    );
  }

  try {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.symbolText}>{symbol}</Text>
              <Text style={styles.typeText}>Perp</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.text.accent}
              colors={[colors.text.accent]}
            />
          }
        >
          {(() => {
            try {
              return (
                <AdvancedTradingChart
                  symbol={symbol as string}
                  currentPrice={loadingPrice ? 0 : currentPrice}
                  change={change}
                  changePercent={changePercent}
                  interval={selectedInterval}
                  onIntervalChange={handlePeriodChange}
                />
              );
            } catch (error) {
              return (
                <View style={{ padding: 20, backgroundColor: "red" }}>
                  <Text style={{ color: "white" }}>
                    Chart Error: {String(error)}
                  </Text>
                </View>
              );
            }
          })()}

          <TimePeriodSelector onPeriodChange={handlePeriodChange} />

          <View style={styles.balanceSection}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Available to trade</Text>
              <View style={styles.balanceRight}>
                {loadingBalance ? (
                  <ActivityIndicator size="small" color={colors.text.accent} />
                ) : (
                  <Text style={styles.balanceAmount}>
                    ${balance.toFixed(2)}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddFunds}
                >
                  <Ionicons name="add" size={16} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            {/* Your Position Section */}
            {hasPosition && currentPosition && (
              <View style={styles.positionSection}>
                <Text style={styles.positionSectionTitle}>Your Position</Text>
                <View style={styles.positionGrid}>
                  {/* PNL Box */}
                  <View style={styles.positionBox}>
                    <Text style={styles.positionBoxLabel}>PNL</Text>
                    <Text
                      style={[
                        styles.positionBoxValue,
                        {
                          color:
                            parseFloat(
                              currentPosition.position.unrealizedPnl
                            ) >= 0
                              ? colors.accent.green
                              : colors.accent.red,
                        },
                      ]}
                    >
                      {parseFloat(currentPosition.position.unrealizedPnl) >= 0
                        ? "+"
                        : ""}
                      $
                      {Math.abs(
                        parseFloat(currentPosition.position.unrealizedPnl)
                      ).toFixed(2)}
                    </Text>
                  </View>

                  {/* ROI Box */}
                  <View style={styles.positionBox}>
                    <Text style={styles.positionBoxLabel}>ROI</Text>
                    <Text
                      style={[
                        styles.positionBoxValue,
                        {
                          color:
                            parseFloat(
                              currentPosition.position.unrealizedPnl
                            ) >= 0
                              ? colors.accent.green
                              : colors.accent.red,
                        },
                      ]}
                    >
                      {(() => {
                        const pnl = parseFloat(
                          currentPosition.position.unrealizedPnl
                        );
                        const entryPrice = parseFloat(
                          currentPosition.position.entryPx
                        );
                        const size = Math.abs(
                          parseFloat(currentPosition.position.szi)
                        );
                        const positionValue = entryPrice * size;
                        const roi =
                          positionValue > 0 ? (pnl / positionValue) * 100 : 0;
                        return `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`;
                      })()}
                    </Text>
                  </View>

                  {/* Size Box */}
                  <View style={styles.positionBox}>
                    <Text style={styles.positionBoxLabel}>Size</Text>
                    <Text style={styles.positionBoxValue}>
                      {Math.abs(
                        parseFloat(currentPosition.position.szi)
                      ).toFixed(4)}{" "}
                      {symbol.replace("-USD", "")}
                    </Text>
                  </View>

                  {/* Margin Box */}
                  <View style={styles.positionBox}>
                    <Text style={styles.positionBoxLabel}>
                      Margin (Isolated)
                    </Text>
                    <Text style={styles.positionBoxValue}>
                      $
                      {(
                        parseFloat(currentPosition.position.marginUsed) || 0
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.fixedButtonContainer}>
          <View style={styles.tradingButtons}>
            {hasPosition ? (
              <>
                <TouchableOpacity
                  style={[styles.tradingButton, styles.modifyButton]}
                  onPress={handleModifyPress}
                >
                  <Text
                    style={[
                      styles.tradingButtonText,
                      { color: colors.text.primary },
                    ]}
                  >
                    Modify
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tradingButton,
                    isLongPosition
                      ? styles.closeLongButton
                      : styles.closeShortButton,
                  ]}
                  onPress={handleClosePress}
                >
                  <Text style={styles.tradingButtonText}>
                    Close {isLongPosition ? "Long" : "Short"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.tradingButton, styles.longButton]}
                  onPress={handleLongPress}
                >
                  <Text style={styles.tradingButtonText}>Long</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tradingButton, styles.shortButton]}
                  onPress={handleShortPress}
                >
                  <Text style={styles.tradingButtonText}>Short</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <BottomNavigation />

        {/* Modify Position Bottom Sheet */}
        <ModifyPositionBottomSheet
          visible={showModifySheet}
          onClose={() => setShowModifySheet(false)}
          onAddToPosition={handleAddToPosition}
          onReducePosition={handleReducePosition}
        />

        {/* Close Position Bottom Sheet */}
        <ClosePositionBottomSheet
          visible={showCloseSheet}
          onClose={() => setShowCloseSheet(false)}
          position={currentPosition}
          currentPrice={currentPrice}
          symbol={symbol}
        />
      </SafeAreaView>
    );
  } catch (renderError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
}
