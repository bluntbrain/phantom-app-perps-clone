import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../constants/colors';
import { spacing, fontSize, borderRadius } from '../constants/spacing';
import { haptics } from '../utils/haptics';
import { RootStackParamList } from '../navigation/AppNavigator';

type ReviewOrderScreenRouteProp = RouteProp<RootStackParamList, 'ReviewOrder'>;
type ReviewOrderScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const ReviewOrderScreen: React.FC = () => {
  const navigation = useNavigation<ReviewOrderScreenNavigationProp>();
  const route = useRoute<ReviewOrderScreenRouteProp>();

  const { symbol, isLong, amount, leverage, leveragedSize, currentPrice } =
    route.params;

  const handleBack = () => {
    haptics.light();
    navigation.goBack();
  };

  const handleOpenPosition = () => {
    haptics.medium();
    // TODO: implement position opening logic
    console.log('Opening position:', {
      symbol,
      isLong,
      amount,
      leverage,
      leveragedSize,
    });

    navigation.navigate('Home');
  };

  const ethAmount = parseFloat(amount) / currentPrice;
  const liquidationPrice = isLong
    ? currentPrice * 0.975 // 2.5% below for long
    : currentPrice * 1.025; // 2.5% above for short

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background.primary}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="chevron-left" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Order</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Position Summary */}
        <View style={styles.positionCard}>
          <View style={styles.positionHeader}>
            <View style={styles.cryptoIcon}>
              <Icon name="dollar-sign" size={24} color={colors.text.primary} />
            </View>
            <View style={styles.positionInfo}>
              <Text style={styles.positionTitle}>
                {symbol} {isLong ? 'Long' : 'Short'}
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
              <Icon name="info" size={16} color={colors.text.secondary} />
            </View>
            <View style={styles.sizeValue}>
              <Text style={styles.detailValue}>${leveragedSize}</Text>
              <Text style={styles.ethAmount}>{ethAmount.toFixed(4)} ETH</Text>
            </View>
          </View>

          {/* Fee */}
          <View style={styles.detailRow}>
            <View style={styles.labelWithIcon}>
              <Text style={styles.detailLabel}>Fee</Text>
              <Icon name="info" size={16} color={colors.text.secondary} />
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
              ${currentPrice.toLocaleString()}
            </Text>
          </View>

          {/* Liquidation Price */}
          <View style={styles.priceRow}>
            <View style={styles.labelWithIcon}>
              <Text style={styles.priceLabel}>Liquidation Price</Text>
              <Icon name="info" size={16} color={colors.text.secondary} />
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
            Open {isLong ? 'Long' : 'Short'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  positionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  positionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cryptoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  positionInfo: {
    flex: 1,
  },
  positionTitle: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  positionAmount: {
    color: colors.text.primary,
    fontSize: fontSize.xxxl,
    fontWeight: '300',
  },
  detailsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailLabel: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  detailValue: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
    textAlign: 'right',
  },
  sizeValue: {
    alignItems: 'flex-end',
  },
  ethAmount: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  priceCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  priceLabel: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  priceValue: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  liquidationPrice: {
    color: colors.accent.red,
    fontSize: fontSize.md,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  riskDisclosure: {
    marginVertical: spacing.lg,
  },
  riskText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.4,
    textAlign: 'left',
  },
  buttonContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  openButton: {
    backgroundColor: colors.accent.purple,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  openButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
