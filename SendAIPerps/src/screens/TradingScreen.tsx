import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../constants/colors';
import { spacing, fontSize, borderRadius } from '../constants/spacing';
import { haptics } from '../utils/haptics';
import { AdvancedTradingChart } from '../components/AdvancedTradingChart';
import { TimePeriodSelector } from '../components/TimePeriodSelector';
import { BottomNavigation } from '../components/BottomNavigation';
import { RootStackParamList } from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/Feather';

type TradingScreenRouteProp = RouteProp<RootStackParamList, 'Trading'>;
type TradingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Trading'
>;

export const TradingScreen: React.FC = () => {
  const navigation = useNavigation<TradingScreenNavigationProp>();
  const route = useRoute<TradingScreenRouteProp>();

  const { symbol = 'ETH-USD' } = route.params || {};

  // mock data
  const currentPrice = 4460.1;
  const change = 19.9;
  const changePercent = 0.45;
  const availableBalance = 0.0;

  const handleBackPress = () => {
    haptics.light();
    navigation.goBack();
  };

  const handleLongPress = () => {
    haptics.medium();
    navigation.navigate('LongShort', { symbol, isLong: true });
  };

  const handleShortPress = () => {
    haptics.medium();
    navigation.navigate('LongShort', { symbol, isLong: false });
  };

  const handlePeriodChange = (period: string) => {
    haptics.selection();
    console.log(`Time period changed to: ${period}`);
    // TODO: Update chart data based on selected period
  };

  const handleAddFunds = () => {
    haptics.light();
    navigation.navigate('AddFunds');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Icon name="chevron-left" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.cryptoIcon}>
            <View
              style={[
                styles.iconPlaceholder,
                { backgroundColor: colors.crypto.ethereum },
              ]}
            />
          </View>
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
      >
        {/* Chart */}
        <AdvancedTradingChart
          symbol={symbol}
          currentPrice={currentPrice}
          change={change}
          changePercent={changePercent}
        />

        {/* Time Period Selector */}
        <TimePeriodSelector onPeriodChange={handlePeriodChange} />

        {/* Available Balance */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available to trade</Text>
            <View style={styles.balanceRight}>
              <Text style={styles.balanceAmount}>
                ${availableBalance.toFixed(2)}
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddFunds}
              >
                <Icon name="plus" size={16} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>Info</Text>
        </View>
      </ScrollView>

      {/* Fixed Trading Buttons */}
      <View style={styles.fixedButtonContainer}>
        <View style={styles.tradingButtons}>
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
        </View>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation />
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
    marginRight: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cryptoIcon: {
    marginRight: spacing.sm,
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
  },
  headerText: {
    alignItems: 'flex-start',
  },
  symbolText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  typeText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  fixedButtonContainer: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    paddingTop: spacing.sm,
  },

  balanceSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
  balanceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  balanceAmount: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  infoText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
  tradingButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  tradingButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  longButton: {
    backgroundColor: colors.accent.purple,
  },
  shortButton: {
    backgroundColor: colors.accent.purple,
  },
  tradingButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
