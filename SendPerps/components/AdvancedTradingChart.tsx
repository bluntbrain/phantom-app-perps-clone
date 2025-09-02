import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  PanResponder,
} from "react-native";
import Svg, {
  Rect,
  Line,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { spacing, fontSize, borderRadius } from "../constants/spacing";
import { haptics } from "../utils/haptics";
import { FullScreenChart } from "./FullScreenChart";
import { hyperliquidService, CandleData } from "../services/HyperliquidService";

interface AdvancedTradingChartProps {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  interval?: string;
  onFullScreen?: () => void;
  onIntervalChange?: (interval: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const AdvancedTradingChart: React.FC<AdvancedTradingChartProps> = ({
  symbol,
  currentPrice,
  change,
  changePercent,
  interval = "1m",
  onFullScreen: _onFullScreen,
  onIntervalChange,
}) => {
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [crosshairVisible, setCrosshairVisible] = useState(false);
  const [crosshairPosition, setCrosshairPosition] = useState({ x: 0, y: 0 });
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [realTimePrice, setRealTimePrice] = useState<number>(0);
  const [hasReceivedFirstPrice, setHasReceivedFirstPrice] =
    useState<boolean>(false);
  const [firstReceivedPrice, setFirstReceivedPrice] = useState<number>(0);
  const [snapshotData, setSnapshotData] = useState<CandleData[]>([]);
  const [isReceivingSnapshot, setIsReceivingSnapshot] =
    useState<boolean>(false);
  const [firstSnapshotPrice, setFirstSnapshotPrice] = useState<number>(0);

  const mountedRef = useRef(true);

  const chartWidth = screenWidth - spacing.md * 2;
  const chartHeight = 300;
  const fullScreenChartHeight = screenHeight * 0.7;
  const padding = { left: 20, right: 40, top: 20, bottom: 60 };

  const [translateX, setTranslateX] = useState(0);

  // extract coin from pair
  const getCoinSymbol = useCallback((tradingSymbol: string): string => {
    if (!tradingSymbol || typeof tradingSymbol !== "string") {
      return "BTC"; // fallback
    }
    const coin = tradingSymbol.split("-")[0];
    return coin;
  }, []);

  // get interval ms
  const getIntervalMs = (intervalStr: string): number => {
    const intervals: { [key: string]: number } = {
      "1m": 60 * 1000,
      "5m": 5 * 60 * 1000,
      "15m": 15 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "4h": 4 * 60 * 60 * 1000,
      "1d": 24 * 60 * 60 * 1000,
    };
    return intervals[intervalStr] || 60 * 1000; // default 1m
  };

  // websocket setup
  const startWebSocketConnections = useCallback(
    async (coin: string) => {
      // fetch history first
      try {
        const historicalCandles = await hyperliquidService.getCandleSnapshot(
          coin,
          interval
        );
        if (historicalCandles.length > 0) {
          // baseline for %
          const firstPrice = historicalCandles[0].close;
          setFirstSnapshotPrice(firstPrice);

          setChartData(historicalCandles);
          setWsConnected(true);
        }
      } catch (error) {
        console.error("chart: fetch error", error);
      }

      // price ws
      hyperliquidService.subscribeToPrice(coin, (price: number) => {
        if (!mountedRef.current) return;

        // first price
        if (!hasReceivedFirstPrice) {
          setRealTimePrice(price);
          setFirstReceivedPrice(price);
          setHasReceivedFirstPrice(true);
          setLastUpdateTime(new Date().toLocaleTimeString());
          setWsConnected(true);
          return;
        }

        setRealTimePrice(price);
        setLastUpdateTime(new Date().toLocaleTimeString());
        setWsConnected(true);

        // update last candle
        setChartData((prevData) => {
          try {
            if (prevData.length === 0) {
              // create initial
              const now = Date.now();
              const basicCandle: CandleData = {
                timestamp: now,
                open: price,
                high: price,
                low: price,
                close: price,
                volume: 0,
              };
              return [basicCandle];
            }
          } catch (error) {
            return prevData;
          }

          try {
            const newData = [...prevData];
            const lastCandle = newData[newData.length - 1];

            if (!lastCandle || typeof lastCandle !== "object") {
              return prevData;
            }

            // update current
            const updatedCandle = {
              ...lastCandle,
              close: price,
              high: Math.max(lastCandle.high || 0, price),
              low: Math.min(lastCandle.low || price, price),
              timestamp: Date.now(),
            };

            newData[newData.length - 1] = updatedCandle;
            return newData;
          } catch (error) {
            return prevData;
          }
        });
      });

      // candle ws
      const candleCallback = (candleData: CandleData) => {
        if (!mountedRef.current) {
          return;
        }

        // validate
        if (!candleData || typeof candleData !== "object") {
          return;
        }

        // valid prices only
        if (candleData.open > 0 && candleData.close > 0) {
          setChartData((prevData) => {
            if (prevData.length === 0) {
              return [candleData];
            }

            const newData = [...prevData];
            const lastCandle = newData[newData.length - 1];

            // interval ms
            const intervalMs = getIntervalMs(interval);
            const currentTimestamp = candleData.timestamp || Date.now();
            const lastTimestamp = lastCandle?.timestamp || Date.now();
            const timeDiff = currentTimestamp - lastTimestamp;

            if (timeDiff < intervalMs) {
              // update current
              newData[newData.length - 1] = {
                ...candleData,
                open: lastCandle.open, // keep open
                high: Math.max(lastCandle.high, candleData.high),
                low: Math.min(lastCandle.low, candleData.low),
              };
            } else {
              // new period
              // rolling window
              const maxCandles = 100;
              if (newData.length >= maxCandles) {
                newData.shift(); // remove oldest
              }
              newData.push(candleData);
            }

            return newData;
          });

          // update price
          if (mountedRef.current) {
            setRealTimePrice(candleData.close);
          }
        }
      };

      // subscribe
      hyperliquidService.subscribeToCandles(coin, interval, candleCallback);
    },
    [interval]
  ); // interval only

  const cleanupWebSockets = useCallback((coin: string) => {
    hyperliquidService.unsubscribeFromPrice(coin);
    hyperliquidService.unsubscribeFromCandles(coin);
    setWsConnected(false);
  }, []);

  // init chart
  useEffect(() => {
    mountedRef.current = true;

    try {
      const coin = getCoinSymbol(symbol);

      // reset for interval
      setChartData([]);
      setSnapshotData([]);
      setIsReceivingSnapshot(false);
      setFirstSnapshotPrice(0);

      // start ws
      startWebSocketConnections(coin);
    } catch (error) {
      console.error("chart: init error", error);
    }

    return () => {
      mountedRef.current = false;
      try {
        const coin = getCoinSymbol(symbol);
        cleanupWebSockets(coin);
      } catch (error) {
        console.error("chart: cleanup error", error);
      }
    };
  }, [
    symbol,
    interval,
    getCoinSymbol,
    startWebSocketConnections,
    cleanupWebSockets,
  ]); // deps

  // fallback candle
  useEffect(() => {
    if (chartData.length > 0) return;

    let fallbackTimeout: ReturnType<typeof setTimeout>;

    if (wsConnected && hasReceivedFirstPrice && realTimePrice > 0) {
      // create after 3s
      fallbackTimeout = setTimeout(() => {
        if (chartData.length === 0 && realTimePrice > 0 && mountedRef.current) {
          const now = Date.now();
          const fallbackCandle: CandleData = {
            timestamp: now,
            open: realTimePrice,
            high: realTimePrice,
            low: realTimePrice,
            close: realTimePrice,
            volume: 0,
          };
          setChartData([fallbackCandle]);
        }
      }, 3000); // 3s
    } else if (!wsConnected) {
      // reconnect after 10s
      fallbackTimeout = setTimeout(() => {
        if (!wsConnected && chartData.length === 0 && mountedRef.current) {
          const coin = getCoinSymbol(symbol);
          startWebSocketConnections(coin);
        }
      }, 10000);
    }

    return () => {
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
    };
  }, [
    wsConnected,
    chartData.length,
    realTimePrice,
    hasReceivedFirstPrice,
    symbol,
    interval,
    getCoinSymbol,
    startWebSocketConnections,
  ]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      try {
        haptics.light();
        const { locationX, locationY } = evt.nativeEvent;
        setCrosshairPosition({ x: locationX, y: locationY });
        setCrosshairVisible(true);

        if (chartData.length > 0) {
          const candleIndex = Math.floor(
            (locationX - padding.left + translateX) /
              ((chartWidth - padding.left - padding.right) / chartData.length)
          );
          if (candleIndex >= 0 && candleIndex < chartData.length) {
            setHoveredCandle(chartData[candleIndex]);
          }
        }
      } catch (error) {}
    },

    onPanResponderMove: (evt, gestureState) => {
      try {
        const { locationX, locationY } = evt.nativeEvent;

        if (gestureState.numberActiveTouches === 1) {
          setCrosshairPosition({ x: locationX, y: locationY });

          if (chartData.length > 0) {
            const candleIndex = Math.floor(
              (locationX - padding.left + translateX) /
                ((chartWidth - padding.left - padding.right) / chartData.length)
            );
            if (candleIndex >= 0 && candleIndex < chartData.length) {
              setHoveredCandle(chartData[candleIndex]);
            }
          }
        } else if (
          gestureState.numberActiveTouches === 2 &&
          chartData.length > 0
        ) {
          const newTranslateX = Math.max(
            Math.min(translateX + gestureState.dx, 0),
            -(chartData.length * 10 - chartWidth)
          );
          setTranslateX(newTranslateX);
        }
      } catch (error) {}
    },

    onPanResponderRelease: () => {
      setCrosshairVisible(false);
    },
  });

  const renderCandlesticks = (isFullScreen = false) => {
    if (!chartData || chartData.length === 0) return null;

    try {
      const currentChartWidth = isFullScreen ? screenWidth : chartWidth;
      const currentChartHeight = isFullScreen
        ? fullScreenChartHeight
        : chartHeight;
      const innerWidth = currentChartWidth - padding.left - padding.right;
      const innerHeight = currentChartHeight - padding.top - padding.bottom;

      // validate prices
      const validCandles = chartData.filter(
        (d) => d && typeof d === "object" && d.low > 0 && d.high > 0
      );
      if (validCandles.length === 0) return null;

      const lows = validCandles.map((d) => d.low);
      const highs = validCandles.map((d) => d.high);

      const minPrice = Math.min(...lows) * 0.999;
      const maxPrice = Math.max(...highs) * 1.001;
      const priceRange = maxPrice - minPrice;

      // check range
      if (priceRange <= 0) return null;

      const volumes = validCandles.map((d) => d.volume || 0);
      const maxVolume = Math.max(...volumes);

      // calc width
      const availableWidthPerCandle = innerWidth / validCandles.length;
      const maxCandleWidth = 8; // max 8px
      const minCandleWidth = 2; // min 2px
      const candleWidth = Math.min(
        maxCandleWidth,
        Math.max(minCandleWidth, availableWidthPerCandle * 0.6)
      );

      return (
        <Svg
          width={currentChartWidth}
          height={currentChartHeight}
          {...(isFullScreen ? {} : panResponder.panHandlers)}
        >
          <Defs>
            <LinearGradient
              id="volumeGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <Stop
                offset="0%"
                stopColor={colors.accent.blue}
                stopOpacity="0.3"
              />
              <Stop
                offset="100%"
                stopColor={colors.accent.blue}
                stopOpacity="0.1"
              />
            </LinearGradient>
          </Defs>

          {[0.2, 0.4, 0.6, 0.8].map((ratio, index) => (
            <Line
              key={index}
              x1={padding.left}
              y1={padding.top + ratio * innerHeight}
              x2={padding.left + innerWidth}
              y2={padding.top + ratio * innerHeight}
              stroke={colors.border.primary}
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />
          ))}

          {maxVolume > 0 &&
            validCandles.map((candle, index) => {
              const candleSpacing = innerWidth / validCandles.length;
              const xCenter = padding.left + (index + 0.5) * candleSpacing;
              const x = xCenter - candleWidth / 2;
              const volumeHeight =
                ((candle.volume || 0) / maxVolume) * (innerHeight * 0.2);

              // skip zero vol
              if (volumeHeight === 0) return null;

              return (
                <Rect
                  key={`volume-${index}`}
                  x={x}
                  y={currentChartHeight - padding.bottom - volumeHeight}
                  width={candleWidth}
                  height={volumeHeight}
                  fill="url(#volumeGradient)"
                />
              );
            })}

          {validCandles.map((candle, index) => {
            const candleSpacing = innerWidth / validCandles.length;
            const xCenter = padding.left + (index + 0.5) * candleSpacing;
            const x = xCenter - candleWidth / 2;
            const openY =
              padding.top +
              ((maxPrice - candle.open) / priceRange) * innerHeight;
            const closeY =
              padding.top +
              ((maxPrice - candle.close) / priceRange) * innerHeight;
            const highY =
              padding.top +
              ((maxPrice - candle.high) / priceRange) * innerHeight;
            const lowY =
              padding.top +
              ((maxPrice - candle.low) / priceRange) * innerHeight;

            const isGreen = candle.close >= candle.open;
            const candleColor = isGreen
              ? colors.accent.green
              : colors.accent.red;

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.abs(closeY - openY) || 1;

            return (
              <G key={`candle-${index}`}>
                <Line
                  x1={xCenter}
                  y1={highY}
                  x2={xCenter}
                  y2={lowY}
                  stroke={candleColor}
                  strokeWidth="1"
                />

                <Rect
                  x={x}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={candleColor}
                  stroke={candleColor}
                  strokeWidth="1"
                />
              </G>
            );
          })}

          {[
            maxPrice,
            maxPrice * 0.75 + minPrice * 0.25,
            (maxPrice + minPrice) / 2,
            maxPrice * 0.25 + minPrice * 0.75,
            minPrice,
          ].map((price, index) => (
            <SvgText
              key={index}
              x={currentChartWidth - padding.right + 10}
              y={padding.top + (index * innerHeight) / 4 + 4}
              fontSize="10"
              fill={colors.text.secondary}
              textAnchor="start"
            >
              {price.toFixed(1)}
            </SvgText>
          ))}

          {(() => {
            const currentPriceY =
              padding.top +
              ((maxPrice - realTimePrice) / priceRange) * innerHeight;
            return (
              <>
                <Line
                  x1={padding.left}
                  y1={currentPriceY}
                  x2={padding.left + innerWidth}
                  y2={currentPriceY}
                  stroke={colors.accent.orange}
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />

                <Rect
                  x={currentChartWidth - padding.right + 5}
                  y={currentPriceY - 8}
                  width={40}
                  height={16}
                  fill={colors.accent.orange}
                  rx="2"
                />
                <SvgText
                  x={currentChartWidth - padding.right + 25}
                  y={currentPriceY + 3}
                  fontSize="10"
                  fill={colors.background.primary}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {realTimePrice.toFixed(1)}
                </SvgText>
              </>
            );
          })()}

          {crosshairVisible && (
            <G>
              <Line
                x1={padding.left}
                y1={crosshairPosition.y}
                x2={padding.left + innerWidth}
                y2={crosshairPosition.y}
                stroke={colors.text.primary}
                strokeWidth="0.5"
                strokeOpacity="0.8"
                strokeDasharray="3,3"
              />
              <Line
                x1={crosshairPosition.x}
                y1={padding.top}
                x2={crosshairPosition.x}
                y2={padding.top + innerHeight}
                stroke={colors.text.primary}
                strokeWidth="0.5"
                strokeOpacity="0.8"
                strokeDasharray="3,3"
              />
            </G>
          )}
        </Svg>
      );
    } catch (error) {
      console.error("chart: render error", error);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Chart rendering error</Text>
        </View>
      );
    }
  };

  const handleFullScreen = () => {
    haptics.medium();
    setFullScreenVisible(true);
  };

  try {
    return (
      <View style={styles.container}>
        <View style={styles.chartHeader}>
          <View style={styles.priceInfo}>
            <View style={styles.symbolRow}>
              <Text style={styles.symbolText}>{symbol}</Text>
              {lastUpdateTime && (
                <Text style={styles.updateTimeText}>{lastUpdateTime}</Text>
              )}
            </View>
            <Text style={styles.priceText}>${realTimePrice.toFixed(2)}</Text>
            <Text
              style={[
                styles.changeText,
                {
                  color: (() => {
                    const baselinePrice =
                      firstSnapshotPrice > 0
                        ? firstSnapshotPrice
                        : firstReceivedPrice > 0
                        ? firstReceivedPrice
                        : 0;
                    if (baselinePrice > 0) {
                      return realTimePrice >= baselinePrice
                        ? colors.accent.green
                        : colors.accent.red;
                    }
                    return change >= 0
                      ? colors.accent.green
                      : colors.accent.red;
                  })(),
                },
              ]}
            >
              {(() => {
                // calc from baseline
                const baselinePrice =
                  firstSnapshotPrice > 0
                    ? firstSnapshotPrice
                    : firstReceivedPrice > 0
                    ? firstReceivedPrice
                    : 0;
                const priceChange =
                  baselinePrice > 0 ? realTimePrice - baselinePrice : change;
                const percentChange =
                  baselinePrice > 0
                    ? ((realTimePrice - baselinePrice) / baselinePrice) * 100
                    : changePercent;

                return `${priceChange >= 0 ? "+" : ""}$${priceChange.toFixed(
                  2
                )} (${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(
                  2
                )}%)`;
              })()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.fullScreenButton}
            onPress={handleFullScreen}
          >
            <Ionicons name="expand" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.ohlcInfo}>
          {(() => {
            const candle =
              hoveredCandle ||
              (chartData.length > 0 ? chartData[chartData.length - 1] : null);
            if (!candle || typeof candle !== "object") return null;

            // validate vals
            const open = typeof candle.open === "number" ? candle.open : 0;
            const close = typeof candle.close === "number" ? candle.close : 0;
            const high = typeof candle.high === "number" ? candle.high : 0;
            const low = typeof candle.low === "number" ? candle.low : 0;
            const vol = typeof candle.volume === "number" ? candle.volume : 0;

            const isGreen = close >= open;
            const volume = (vol / 1000000).toFixed(1);

            return (
              <View style={styles.ohlcCompact}>
                <Text style={styles.ohlcText}>
                  <Text style={styles.ohlcLabel}>O </Text>
                  <Text style={styles.ohlcValue}>{open.toFixed(2)}</Text>
                  <Text style={styles.ohlcSeparator}> • </Text>

                  <Text style={styles.ohlcLabel}>H </Text>
                  <Text style={[styles.ohlcValue, styles.highValue]}>
                    {high.toFixed(2)}
                  </Text>
                  <Text style={styles.ohlcSeparator}> • </Text>

                  <Text style={styles.ohlcLabel}>L </Text>
                  <Text style={[styles.ohlcValue, styles.lowValue]}>
                    {low.toFixed(2)}
                  </Text>
                  <Text style={styles.ohlcSeparator}> • </Text>

                  <Text style={styles.ohlcLabel}>C </Text>
                  <Text
                    style={[
                      styles.ohlcValue,
                      isGreen ? styles.greenValue : styles.redValue,
                    ]}
                  >
                    {close.toFixed(2)}
                  </Text>
                </Text>

                <Text style={styles.volumeCompact}>
                  Vol {volume}M
                  {hoveredCandle && (
                    <Text style={styles.timeStamp}>
                      {" • "}
                      {new Date(hoveredCandle.timestamp).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </Text>
                  )}
                </Text>
              </View>
            );
          })()}
        </View>

        <View style={styles.chartContainer}>
          {(() => {
            if (chartData.length === 0) {
              return (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingContent}>
                    <Text style={styles.loadingText}>
                      {isReceivingSnapshot
                        ? `Loading ${snapshotData.length} candles...`
                        : wsConnected
                        ? "Loading chart data..."
                        : "Connecting to live data..."}
                    </Text>
                    <Text style={styles.loadingSubtext}>
                      {isReceivingSnapshot
                        ? `Receiving historical data (${snapshotData.length} candles)`
                        : wsConnected
                        ? "Fetching historical candles from WebSocket"
                        : "Establishing connection to Hyperliquid WebSocket"}
                    </Text>
                  </View>
                </View>
              );
            } else {
              return renderCandlesticks(false);
            }
          })()}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Tap & hold: Crosshair • Two fingers: Pan • Tap fullscreen for
            advanced features
          </Text>
        </View>

        <FullScreenChart
          visible={fullScreenVisible}
          onClose={() => setFullScreenVisible(false)}
          symbol={symbol}
          currentPrice={realTimePrice}
          renderCandlesticks={renderCandlesticks}
          currentInterval={interval}
          onIntervalChange={(newInterval) => {
            // trigger parent update
            // propagates via props
            if (onIntervalChange) {
              onIntervalChange(newInterval);
            }
          }}
        />
      </View>
    );
  } catch (error) {
    console.error("chart: critical error", error);

    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Critical Chart Error</Text>
          <Text style={styles.errorText}>{String(error)}</Text>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    marginVertical: spacing.md,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  priceInfo: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  symbolText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  updateTimeText: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontWeight: "500",
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  priceText: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  changeText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  fullScreenButton: {
    padding: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: 6,
  },
  ohlcInfo: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.blue,
  },
  ohlcCompact: {
    gap: spacing.xs,
  },
  ohlcText: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.2,
  },
  ohlcLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  ohlcValue: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  ohlcSeparator: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
  },
  highValue: {
    color: colors.accent.green,
  },
  lowValue: {
    color: colors.accent.red,
  },
  greenValue: {
    color: colors.accent.green,
  },
  redValue: {
    color: colors.accent.red,
  },
  volumeCompact: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontFamily: "monospace",
  },
  timeStamp: {
    color: colors.accent.blue,
    fontSize: fontSize.xs,
  },
  chartContainer: {
    marginHorizontal: spacing.sm,
  },
  instructions: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  instructionText: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    textAlign: "center",
    fontStyle: "italic",
  },
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
  loadingContent: {
    alignItems: "center",
    gap: spacing.xs,
  },
  loadingText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    textAlign: "center",
    fontWeight: "600",
  },
  loadingSubtext: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    textAlign: "center",
    fontStyle: "italic",
  },
  errorContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
  errorText: {
    color: colors.accent.red,
    fontSize: fontSize.md,
    textAlign: "center",
  },
});
