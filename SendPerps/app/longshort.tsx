import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing, fontSize, borderRadius } from '../constants/spacing';
import * as Haptics from 'expo-haptics';
import { LeverageBottomSheet } from '../components/LeverageBottomSheet';
import { Keypad } from '../components/Keypad';

export default function LongShortScreen() {
  const { symbol, isLong, autoCloseEnabled = 'false' } = useLocalSearchParams();

  const [size, setSize] = useState('0');
  const [leverage, setLeverage] = useState('2');
  const [autoClose, setAutoClose] = useState(false);
  const [showLeverageSheet, setShowLeverageSheet] = useState(false);

  const availableBalance = 1000.0; // mock balance
  const currentPrice = 4460.1; // mock price

  useEffect(() => {
    setAutoClose(autoCloseEnabled === 'true');
  }, [autoCloseEnabled]);

  const handleBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const handleKeypadPress = (key: string) => {
    if (key === 'backspace') {
      if (size.length > 0) {
        const newSize = size.slice(0, -1);
        setSize(newSize || '0');
      }
    } else if (key === '.') {
      if (!size.includes('.')) {
        const newSize = size === '0' ? '0.' : size + key;
        setSize(newSize);
      }
    } else {
      if (size === '0') {
        setSize(key);
      } else {
        const newSize = size + key;
        setSize(newSize);
      }
    }
  };

  const handleKeypadLongPress = (key: string) => {
    if (key === 'backspace') {
      setSize('0');
    }
  };

  const handleReview = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/revieworder',
      params: {
        symbol: symbol as string,
        isLong: isLong as string,
        amount: size,
        leverage: `${leverage}`,
        leveragedSize: calculateLeveragedSize().replace('$', ''),
        currentPrice: currentPrice.toString(),
      },
    });
  };

  const formatSize = () => {
    const sizeNum = parseFloat(size);
    return sizeNum > 0 ? `$${sizeNum.toFixed(2)}` : '$0';
  };

  const calculateLeveragedSize = () => {
    const sizeNum = parseFloat(size);
    const leverageNum = parseFloat(leverage);
    const leveragedSize = sizeNum * leverageNum;
    return leveragedSize > 0 ? `$${leveragedSize.toFixed(2)}` : '$0';
  };

  const sizeNum = parseFloat(size);
  const isInsufficientFunds = sizeNum > availableBalance;
  const isAmountZero = sizeNum === 0;

  const getButtonText = () => {
    if (isAmountZero) return 'Review';
    if (isInsufficientFunds) return 'Insufficient Funds';
    return 'Review';
  };

  const isButtonDisabled = isAmountZero || isInsufficientFunds;
  const isLongPosition = isLong === 'true';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background.primary}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isLongPosition ? 'Long' : 'Short'} {symbol}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Size Display */}
        <View style={styles.sizeDisplaySection}>
          <Text style={styles.sizeText}>{formatSize()}</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceText}>
              ${availableBalance.toFixed(2)} available
            </Text>
            <TouchableOpacity style={styles.maxButton}>
              <Text style={styles.maxButtonText}>Max</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.addFundsLink}
            onPress={() => {
              Haptics.selectionAsync();
              router.push('/addfunds');
            }}
          >
            <Text style={styles.addFundsText}>Add Funds</Text>
          </TouchableOpacity>
        </View>

        {/* Trading Controls - Combined Card */}
        <View style={styles.controlsCard}>
          {/* Leverage Row */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Leverage</Text>
            <TouchableOpacity
              style={styles.leverageSelector}
              onPress={() => {
                Haptics.selectionAsync();
                setShowLeverageSheet(true);
              }}
            >
              <Text style={styles.leverageText}>{leverage}x</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Size Row */}
          <View style={styles.controlRow}>
            <View style={styles.sizeRow}>
              <Text style={styles.controlLabel}>Size</Text>
              <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
            </View>
            <View style={styles.sizeControls}>
              <Text style={styles.sizeValue}>{calculateLeveragedSize()}</Text>
              <Ionicons name="chevron-up" size={16} color={colors.text.secondary} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Auto Close Row */}
          <TouchableOpacity
            style={styles.controlRow}
            onPress={() => {
              Haptics.selectionAsync();
              router.push({
                pathname: '/autoclosesettings',
                params: { 
                  symbol: symbol as string, 
                  isLong: isLong as string 
                },
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.controlLabel}>Auto Close</Text>
            <View style={styles.customSwitchContainer}>
              <View
                style={[
                  styles.customSwitchTrack,
                  autoClose && styles.customSwitchTrackActive,
                ]}
              >
                <View
                  style={[
                    styles.customSwitchThumb,
                    autoClose && styles.customSwitchThumbActive,
                  ]}
                />
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.text.secondary}
                style={styles.chevronIcon}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Review Button */}
        <View style={styles.reviewSection}>
          <TouchableOpacity
            style={[
              styles.reviewButton,
              isButtonDisabled && styles.reviewButtonDisabled,
              isInsufficientFunds && styles.reviewButtonError,
            ]}
            onPress={handleReview}
            disabled={isButtonDisabled}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.reviewButtonText,
                isInsufficientFunds && styles.reviewButtonErrorText,
              ]}
            >
              {getButtonText()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Keypad */}
        <Keypad
          onKeyPress={handleKeypadPress}
          onLongPress={handleKeypadLongPress}
          size="medium"
          buttonBackgroundColor={colors.background.secondary}
        />

        {/* Risk Disclosure */}
        <View style={styles.disclosureSection}>
          <TouchableOpacity>
            <Text style={styles.disclosureText}>
              Perpetual futures risk disclosure
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Leverage Bottom Sheet */}
      <LeverageBottomSheet
        visible={showLeverageSheet}
        currentLeverage={`${leverage}x`}
        onClose={() => setShowLeverageSheet(false)}
        onSelectLeverage={newLeverage => {
          setLeverage(newLeverage.replace('x', ''));
          setShowLeverageSheet(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
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
    flex: 1,
    textAlign: 'left',
  },
  placeholder: {
    width: 32,
  },
  sizeDisplaySection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sizeText: {
    color: colors.text.primary,
    fontSize: 48,
    fontWeight: '300',
    marginBottom: spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  balanceText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
  maxButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  maxButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  addFundsLink: {
    marginTop: spacing.xs,
  },
  addFundsText: {
    color: colors.accent.blue,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  controlsCard: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginVertical: spacing.xs,
  },
  controlLabel: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  leverageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  leverageText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sizeValue: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  customSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  customSwitchTrack: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  customSwitchTrackActive: {
    backgroundColor: colors.accent.green,
  },
  customSwitchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text.primary,
    alignSelf: 'flex-start',
  },
  customSwitchThumbActive: {
    alignSelf: 'flex-end',
  },
  chevronIcon: {
    marginLeft: spacing.xs,
  },

  reviewSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  reviewButton: {
    backgroundColor: colors.accent.purple,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonDisabled: {
    backgroundColor: colors.background.secondary,
  },
  reviewButtonError: {
    backgroundColor: colors.accent.red,
  },
  reviewButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  reviewButtonErrorText: {
    color: colors.text.primary,
  },

  disclosureSection: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  disclosureText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    textDecorationLine: 'underline',
  },
});