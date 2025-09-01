import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import Svg, {
  Rect,
  Line,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing, fontSize } from '../constants/spacing';
import { haptics } from '../utils/haptics';
import { FullScreenChart } from './FullScreenChart';

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface AdvancedTradingChartProps {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  onFullScreen?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const AdvancedTradingChart: React.FC<AdvancedTradingChartProps> = ({
  symbol,
  currentPrice,
  change,
  changePercent,
  onFullScreen: _onFullScreen,
}) => {
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [crosshairVisible, setCrosshairVisible] = useState(false);
  const [crosshairPosition, setCrosshairPosition] = useState({ x: 0, y: 0 });
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  const chartWidth = screenWidth - spacing.md * 2;
  const chartHeight = 300;
  const fullScreenChartHeight = screenHeight * 0.7;
  const padding = { left: 20, right: 40, top: 20, bottom: 60 };

  const [_scale, _setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);

  const generateCandleData = (basePrice: number): CandleData[] => {
    const data: CandleData[] = [];
    let generatedPrice = basePrice;
    const now = Date.now();

    for (let i = 59; i >= 0; i--) {
      const timestamp = now - i * 60000;

      const openPrice = generatedPrice;
      const volatility = openPrice * 0.002;

      const high = openPrice + Math.random() * volatility * 2;
      const low = openPrice - Math.random() * volatility * 2;
      const close = low + Math.random() * (high - low);

      const priceMove = Math.abs(close - openPrice) / openPrice;
      const baseVolume = 1000000 + Math.random() * 2000000;
      const volume = baseVolume * (1 + priceMove * 10);

      data.push({
        timestamp,
        open: openPrice,
        high,
        low,
        close,
        volume,
      });

      generatedPrice = close + (Math.random() - 0.5) * volatility;
    }

    return data;
  };

  useEffect(() => {
    setChartData(generateCandleData(currentPrice));
  }, [currentPrice]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prevData => {
        const newData = [...prevData];
        const lastCandle = newData[newData.length - 1];

        if (Math.random() > 0.7) {
          const newCandle = {
            timestamp: Date.now(),
            open: lastCandle.close,
            high: lastCandle.close + Math.random() * 10,
            low: lastCandle.close - Math.random() * 10,
            close: lastCandle.close + (Math.random() - 0.5) * 8,
            volume: 1000000 + Math.random() * 2000000,
          };

          newData.shift();
          newData.push(newCandle);
        } else {
          const updatedCandle = { ...lastCandle };
          updatedCandle.high = Math.max(
            updatedCandle.high,
            updatedCandle.close + Math.random() * 5,
          );
          updatedCandle.low = Math.min(
            updatedCandle.low,
            updatedCandle.close - Math.random() * 5,
          );
          updatedCandle.close = updatedCandle.close + (Math.random() - 0.5) * 3;
          updatedCandle.volume += Math.random() * 100000;

          newData[newData.length - 1] = updatedCandle;
        }

        return newData;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: evt => {
      haptics.light();
      const { locationX, locationY } = evt.nativeEvent;
      setCrosshairPosition({ x: locationX, y: locationY });
      setCrosshairVisible(true);

      const candleIndex = Math.floor(
        (locationX - padding.left + translateX) /
          ((chartWidth - padding.left - padding.right) / chartData.length),
      );
      if (candleIndex >= 0 && candleIndex < chartData.length) {
        setHoveredCandle(chartData[candleIndex]);
      }
    },

    onPanResponderMove: (evt, gestureState) => {
      const { locationX, locationY } = evt.nativeEvent;

      if (gestureState.numberActiveTouches === 1) {
        setCrosshairPosition({ x: locationX, y: locationY });

        const candleIndex = Math.floor(
          (locationX - padding.left + translateX) /
            ((chartWidth - padding.left - padding.right) / chartData.length),
        );
        if (candleIndex >= 0 && candleIndex < chartData.length) {
          setHoveredCandle(chartData[candleIndex]);
        }
      } else if (gestureState.numberActiveTouches === 2) {
        const newTranslateX = Math.max(
          Math.min(translateX + gestureState.dx, 0),
          -(chartData.length * 10 - chartWidth),
        );
        setTranslateX(newTranslateX);
      }
    },

    onPanResponderRelease: () => {
      setCrosshairVisible(false);
    },
  });

  const renderCandlesticks = (isFullScreen = false) => {
    if (chartData.length === 0) return null;

    const currentChartWidth = isFullScreen ? screenWidth : chartWidth;
    const currentChartHeight = isFullScreen
      ? fullScreenChartHeight
      : chartHeight;
    const innerWidth = currentChartWidth - padding.left - padding.right;
    const innerHeight = currentChartHeight - padding.top - padding.bottom;

    const minPrice = Math.min(...chartData.map(d => d.low)) * 0.999;
    const maxPrice = Math.max(...chartData.map(d => d.high)) * 1.001;
    const priceRange = maxPrice - minPrice;

    const maxVolume = Math.max(...chartData.map(d => d.volume));
    const candleWidth = (innerWidth / chartData.length) * 0.8;

    return (
      <Svg
        width={currentChartWidth}
        height={currentChartHeight}
        {...(isFullScreen ? {} : panResponder.panHandlers)}
      >
        <Defs>
          <LinearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
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

        {chartData.map((candle, index) => {
          const x = padding.left + (index / chartData.length) * innerWidth;
          const volumeHeight =
            (candle.volume / maxVolume) * (innerHeight * 0.2);

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

        {chartData.map((candle, index) => {
          const x = padding.left + (index / chartData.length) * innerWidth;
          const openY =
            padding.top + ((maxPrice - candle.open) / priceRange) * innerHeight;
          const closeY =
            padding.top +
            ((maxPrice - candle.close) / priceRange) * innerHeight;
          const highY =
            padding.top + ((maxPrice - candle.high) / priceRange) * innerHeight;
          const lowY =
            padding.top + ((maxPrice - candle.low) / priceRange) * innerHeight;

          const isGreen = candle.close >= candle.open;
          const candleColor = isGreen ? colors.accent.green : colors.accent.red;

          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.abs(closeY - openY) || 1;

          return (
            <G key={`candle-${index}`}>
              <Line
                x1={x + candleWidth / 2}
                y1={highY}
                x2={x + candleWidth / 2}
                y2={lowY}
                stroke={candleColor}
                strokeWidth="1"
              />

              <Rect
                x={x}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={isGreen ? candleColor : colors.background.primary}
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
            ((maxPrice - currentPrice) / priceRange) * innerHeight;
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
                {currentPrice.toFixed(1)}
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
  };

  const handleFullScreen = () => {
    haptics.medium();
    setFullScreenVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartHeader}>
        <View style={styles.priceInfo}>
          <Text style={styles.symbolText}>{symbol}</Text>
          <Text style={styles.priceText}>${currentPrice.toFixed(2)}</Text>
          <Text
            style={[
              styles.changeText,
              { color: change >= 0 ? colors.accent.green : colors.accent.red },
            ]}
          >
            {change >= 0 ? '+' : ''}${change.toFixed(2)} (
            {changePercent >= 0 ? '+' : ''}
            {changePercent.toFixed(2)}%)
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
          const candle = hoveredCandle || chartData[chartData.length - 1];
          if (!candle) return null;

          const isGreen = candle.close >= candle.open;
          const volume = (candle.volume / 1000000).toFixed(1);

          return (
            <View style={styles.ohlcCompact}>
              <Text style={styles.ohlcText}>
                <Text style={styles.ohlcLabel}>O </Text>
                <Text style={styles.ohlcValue}>{candle.open.toFixed(2)}</Text>
                <Text style={styles.ohlcSeparator}> • </Text>

                <Text style={styles.ohlcLabel}>H </Text>
                <Text style={[styles.ohlcValue, styles.highValue]}>
                  {candle.high.toFixed(2)}
                </Text>
                <Text style={styles.ohlcSeparator}> • </Text>

                <Text style={styles.ohlcLabel}>L </Text>
                <Text style={[styles.ohlcValue, styles.lowValue]}>
                  {candle.low.toFixed(2)}
                </Text>
                <Text style={styles.ohlcSeparator}> • </Text>

                <Text style={styles.ohlcLabel}>C </Text>
                <Text
                  style={[
                    styles.ohlcValue,
                    isGreen ? styles.greenValue : styles.redValue,
                  ]}
                >
                  {candle.close.toFixed(2)}
                </Text>
              </Text>

              <Text style={styles.volumeCompact}>
                Vol {volume}M
                {hoveredCandle && (
                  <Text style={styles.timeStamp}>
                    {' • '}
                    {new Date(hoveredCandle.timestamp).toLocaleTimeString(
                      'en-US',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </Text>
                )}
              </Text>
            </View>
          );
        })()}
      </View>

      <View style={styles.chartContainer}>{renderCandlesticks(false)}</View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Tap & hold: Crosshair • Two fingers: Pan • Tap fullscreen for advanced features
        </Text>
      </View>

      <FullScreenChart
        visible={fullScreenVisible}
        onClose={() => setFullScreenVisible(false)}
        symbol={symbol}
        currentPrice={currentPrice}
        renderCandlesticks={renderCandlesticks}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    marginVertical: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  priceInfo: {
    flex: 1,
  },
  symbolText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  priceText: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  changeText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
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
    fontWeight: '500',
  },
  ohlcValue: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    fontFamily: 'monospace',
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
    fontFamily: 'monospace',
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
    textAlign: 'center',
    fontStyle: 'italic',
  },
});