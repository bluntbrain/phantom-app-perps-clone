import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import * as Haptics from 'expo-haptics';
import { revieworderStyles as styles } from '../styles/screens/revieworderStyles';

export default function ReviewOrderScreen() {
  const { symbol, isLong, amount, leverage, leveragedSize, currentPrice } = useLocalSearchParams();

  const handleBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const handleOpenPosition = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: implement position opening logic
    console.log('Opening position:', {
      symbol,
      isLong: isLong === 'true',
      amount,
      leverage,
      leveragedSize,
    });

    router.replace('/home');
  };

  const price = parseFloat(currentPrice as string) || 4460.1;
  const amountNum = parseFloat(amount as string) || 0;
  const isLongPosition = isLong === 'true';
  
  const ethAmount = amountNum / price;
  const liquidationPrice = isLongPosition
    ? price * 0.975 // 2.5% below for long
    : price * 1.025; // 2.5% above for short

  const getCryptoColor = () => {
    if (typeof symbol === 'string') {
      if (symbol.includes('ETH')) return colors.crypto.ethereum;
      if (symbol.includes('BTC')) return colors.crypto.bitcoin;
      if (symbol.includes('SOL')) return colors.crypto.solana;
      if (symbol.includes('XRP')) return colors.crypto.ripple;
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
            <View style={[styles.cryptoIcon, { backgroundColor: getCryptoColor() }]}>
              <View style={styles.iconPlaceholder} />
            </View>
            <View style={styles.positionInfo}>
              <Text style={styles.positionTitle}>
                {symbol} {isLongPosition ? 'Long' : 'Short'}
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
              <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
            </View>
            <View style={styles.sizeValue}>
              <Text style={styles.detailValue}>${leveragedSize}</Text>
              <Text style={styles.ethAmount}>{ethAmount.toFixed(4)} {symbol?.toString().replace('-USD', '')}</Text>
            </View>
          </View>

          {/* Fee */}
          <View style={styles.detailRow}>
            <View style={styles.labelWithIcon}>
              <Text style={styles.detailLabel}>Fee</Text>
              <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
            </View>
            <Text style={styles.detailValue}>0.0932%</Text>
          </View>
        </View>

        {/* Price Information */}
        <View style={styles.priceCard}>
          {/* Current Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{symbol} Price</Text>
            <Text style={styles.priceValue}>
              ${price.toLocaleString()}
            </Text>
          </View>

          {/* Liquidation Price */}
          <View style={styles.priceRow}>
            <View style={styles.labelWithIcon}>
              <Text style={styles.priceLabel}>Liquidation Price</Text>
              <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
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
          style={styles.openButton}
          onPress={handleOpenPosition}
          activeOpacity={0.8}
        >
          <Text style={styles.openButtonText}>
            Open {isLongPosition ? 'Long' : 'Short'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}