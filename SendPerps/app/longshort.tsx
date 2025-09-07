import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import * as Haptics from 'expo-haptics';
import { LeverageBottomSheet } from '../components/LeverageBottomSheet';
import { Keypad } from '../components/Keypad';
import { longshortStyles as styles } from '../styles/screens/longshortStyles';
import { useKeypadInput, useTradingCalculations, useWalletBalance } from '../hooks';

export default function LongShortScreen() {
  const { 
    symbol, 
    isLong, 
    autoCloseEnabled = 'false', 
    currentPrice,
    isAddToPosition = 'false',
    isReducePosition = 'false'
  } = useLocalSearchParams();

  const [leverage, setLeverage] = useState('2');
  const [autoClose, setAutoClose] = useState(false);
  const [showLeverageSheet, setShowLeverageSheet] = useState(false);

  const { balance } = useWalletBalance();
  const availableBalance = balance; // use real balance
  const price = parseFloat(currentPrice as string) || 4460.1; // use real price from params
  
  // Use custom hooks - start with $15 to ensure above minimum order value
  const { value: size, handleKeyPress, handleLongPress } = useKeypadInput('15');
  const {
    formatSize,
    calculateLeveragedSize,
    isInsufficientFunds,
    getButtonText,
    isButtonDisabled
  } = useTradingCalculations(size, leverage, availableBalance);

  useEffect(() => {
    setAutoClose(autoCloseEnabled === 'true');
  }, [autoCloseEnabled]);

  const handleBack = () => {
    Haptics.selectionAsync();
    router.back();
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
        currentPrice: price.toString(),
        isAddToPosition,
        isReducePosition,
      },
    });
  };

  const isLongPosition = isLong === 'true';
  const isAddMode = isAddToPosition === 'true';
  const isReduceMode = isReducePosition === 'true';
  
  const getScreenTitle = () => {
    if (isAddMode) {
      return `Add to ${isLongPosition ? 'Long' : 'Short'} ${symbol}`;
    } else if (isReduceMode) {
      return `Reduce ${isLongPosition ? 'Short' : 'Long'} ${symbol}`;
    } else {
      return `${isLongPosition ? 'Long' : 'Short'} ${symbol}`;
    }
  };

  const getCustomButtonText = () => {
    if (isAddMode) {
      return `Add to ${isLongPosition ? 'Long' : 'Short'}`;
    } else if (isReduceMode) {
      return `Reduce Position`;
    } else {
      return 'Review'; // default text
    }
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
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {getScreenTitle()}
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
              {(isAddMode || isReduceMode) ? getCustomButtonText() : getButtonText()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Keypad */}
        <Keypad
          onKeyPress={handleKeyPress}
          onLongPress={handleLongPress}
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