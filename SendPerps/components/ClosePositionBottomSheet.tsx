import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useWalletSigning } from '../hooks/useWalletSigning';
import { hyperliquidService } from '../services/HyperliquidService';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ClosePositionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  position: any;
  currentPrice: number;
  symbol: string;
}

export function ClosePositionBottomSheet({
  visible,
  onClose,
  position,
  currentPrice,
  symbol,
}: ClosePositionBottomSheetProps) {
  const [isClosing, setIsClosing] = useState(false);
  const { signAndPlaceOrder } = useWalletSigning();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleClosePosition = async () => {
    if (!position) return;

    try {
      setIsClosing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const coin = symbol.replace('-USD', '');
      const positionSize = Math.abs(parseFloat(position.position.szi));
      const isLong = parseFloat(position.position.szi) > 0;

      // get asset metadata for proper size formatting
      const meta = await hyperliquidService.getMeta();
      const assetIndex = meta.universe.findIndex((asset: any) => asset.name === coin);
      
      if (assetIndex === -1) {
        throw new Error(`Asset ${coin} not found`);
      }

      const assetMeta = meta.universe[assetIndex];
      const szDecimals = assetMeta.szDecimals || 5;
      const formattedSize = positionSize.toFixed(szDecimals);

      // calculate aggressive price for immediate fill
      // for long close (sell): use price 0.5% below market
      // for short close (buy): use price 0.5% above market  
      const priceAdjustment = isLong ? 0.995 : 1.005; // -0.5% for long, +0.5% for short
      const aggressivePrice = (currentPrice * priceAdjustment).toFixed(2);

      // place opposite order to close position
      const closeOrderParams = {
        coin,
        isBuy: !isLong, // opposite direction to close
        size: formattedSize,
        price: aggressivePrice,
        orderType: 'limit' as const, // use limit order with aggressive price
        reduceOnly: true, // this ensures we're reducing the position
        postOnly: false,
      };

      console.log('[Close Position] Placing order:', closeOrderParams);

      const result = await signAndPlaceOrder(closeOrderParams);

      if (result.status === 'ok') {
        Alert.alert(
          'Position Closed',
          `Successfully closed your ${isLong ? 'long' : 'short'} position for ${coin}`,
          [
            {
              text: 'OK',
              onPress: () => {
                onClose();
                // navigate back or refresh data
              }
            }
          ]
        );
      } else {
        throw new Error(result.response || 'Close order failed');
      }
    } catch (error) {
      console.error('close position failed:', error);
      Alert.alert(
        'Close Failed',
        error instanceof Error ? error.message : 'Failed to close position. Please try again.',
      );
    } finally {
      setIsClosing(false);
    }
  };

  if (!position) return null;

  const positionData = position.position;
  const isLong = parseFloat(positionData.szi) > 0;
  const positionSize = Math.abs(parseFloat(positionData.szi));
  const unrealizedPnl = parseFloat(positionData.unrealizedPnl);
  const pnlColor = unrealizedPnl >= 0 ? colors.accent.green : colors.accent.red;
  const pnlText = `${unrealizedPnl >= 0 ? '+' : ''}$${Math.abs(unrealizedPnl).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.container} onPress={() => {}}>
          {/* Handle Bar */}
          <View style={styles.handle} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Close Position</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Position Info */}
          <View style={styles.positionInfo}>
            <View style={styles.positionHeader}>
              <Text style={styles.coinText}>
                {symbol.replace('-USD', '')} {isLong ? 'Long' : 'Short'}
              </Text>
              <View style={[
                styles.positionTypeTag,
                { backgroundColor: isLong ? colors.accent.green : colors.accent.red }
              ]}>
                <Text style={styles.positionTypeText}>
                  {isLong ? 'LONG' : 'SHORT'}
                </Text>
              </View>
            </View>

            <View style={styles.positionDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Position Size</Text>
                <Text style={styles.detailValue}>
                  {positionSize.toFixed(6)} {symbol.replace('-USD', '')}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Entry Price</Text>
                <Text style={styles.detailValue}>
                  ${parseFloat(positionData.entryPx).toLocaleString()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Current Price</Text>
                <Text style={styles.detailValue}>
                  ${currentPrice.toLocaleString()}
                </Text>
              </View>

              <View style={[styles.detailRow, styles.pnlRow]}>
                <Text style={styles.detailLabel}>Unrealized PnL</Text>
                <Text style={[styles.pnlValue, { color: pnlColor }]}>
                  {pnlText}
                </Text>
              </View>
            </View>
          </View>

          {/* Close Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.closePositionButton, isClosing && { opacity: 0.6 }]}
              onPress={handleClosePosition}
              disabled={isClosing}
              activeOpacity={0.8}
            >
              {isClosing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.text.primary} />
                  <Text style={styles.buttonText}>Closing...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  Close {isLong ? 'Long' : 'Short'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = {
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  container: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.text.secondary,
    borderRadius: 2,
    alignSelf: 'center' as const,
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '600' as const,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  positionInfo: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  positionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
  },
  coinText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  positionTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  positionTypeText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  positionDetails: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
  },
  pnlRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    marginTop: 8,
    paddingTop: 16,
  },
  detailLabel: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  detailValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  pnlValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  closePositionButton: {
    backgroundColor: colors.accent.red,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  loadingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
};