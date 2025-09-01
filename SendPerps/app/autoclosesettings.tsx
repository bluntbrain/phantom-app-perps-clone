import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing, fontSize, borderRadius } from '../constants/spacing';
import * as Haptics from 'expo-haptics';
import { Keypad } from '../components/Keypad';

export default function AutoCloseSettingsScreen() {
  const { symbol, isLong } = useLocalSearchParams();

  // mock price
  const currentPrice = 4456.3;
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [takeProfitGain, setTakeProfitGain] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [stopLossLoss, setStopLossLoss] = useState('');
  const [activeInput, setActiveInput] = useState<
    | 'takeProfitPrice'
    | 'takeProfitGain'
    | 'stopLossPrice'
    | 'stopLossLoss'
    | null
  >(null);

  const handleClose = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const handleCancel = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const handleSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const enabledState = takeProfitPrice !== '' || stopLossPrice !== '';
    router.replace({
      pathname: '/longshort',
      params: {
        symbol: symbol as string,
        isLong: isLong as string,
        autoCloseEnabled: enabledState.toString(),
        // TODO: Pass autoCloseSettings back
      },
    });
  };

  const handleKeypadPress = (key: string) => {
    if (!activeInput) return;

    const setValue =
      activeInput === 'takeProfitPrice'
        ? setTakeProfitPrice
        : activeInput === 'takeProfitGain'
        ? setTakeProfitGain
        : activeInput === 'stopLossPrice'
        ? setStopLossPrice
        : setStopLossLoss;

    const currentValue =
      activeInput === 'takeProfitPrice'
        ? takeProfitPrice
        : activeInput === 'takeProfitGain'
        ? takeProfitGain
        : activeInput === 'stopLossPrice'
        ? stopLossPrice
        : stopLossLoss;

    if (key === 'backspace') {
      if (currentValue.length > 0) {
        const newValue = currentValue.slice(0, -1);
        setValue(newValue);
      }
    } else if (key === '.') {
      if (!currentValue.includes('.')) {
        const newValue = currentValue === '' ? '0.' : currentValue + key;
        setValue(newValue);
      }
    } else {
      const newValue = currentValue === '' ? key : currentValue + key;
      setValue(newValue);
    }
  };

  const handleKeypadLongPress = (key: string) => {
    if (key === 'backspace' && activeInput) {
      const setValue =
        activeInput === 'takeProfitPrice'
          ? setTakeProfitPrice
          : activeInput === 'takeProfitGain'
          ? setTakeProfitGain
          : activeInput === 'stopLossPrice'
          ? setStopLossPrice
          : setStopLossLoss;
      setValue('');
    }
  };

  const handlePercentageSelect = (percentage: string, isProfit: boolean) => {
    Haptics.selectionAsync();
    const percent = parseFloat(
      percentage.replace('%', '').replace('+', '').replace('-', ''),
    );

    if (isProfit) {
      const gain = (currentPrice * percent) / 100;
      const targetPrice = currentPrice + gain;
      setTakeProfitPrice(targetPrice.toFixed(1));
      setTakeProfitGain(percent.toString());
    } else {
      const loss = (currentPrice * percent) / 100;
      const targetPrice = currentPrice - loss;
      setStopLossPrice(targetPrice.toFixed(1));
      setStopLossLoss(percent.toString());
    }
  };

  const isSetEnabled = takeProfitPrice !== '' || stopLossPrice !== '';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background.primary}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitleTop}>Auto Close</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Price Info */}
        <View style={styles.priceSection}>
          <Text style={styles.priceText}>
            {symbol} Price ${currentPrice.toFixed(1)}
          </Text>
        </View>

        {/* Take Profit Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Take profit when</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Text style={styles.inputLabel}>Price reaches</Text>
              <TouchableOpacity
                style={[
                  styles.inputField,
                  activeInput === 'takeProfitPrice' && styles.inputFieldActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveInput('takeProfitPrice');
                }}
              >
                <Text style={styles.inputPrefix}>$</Text>
                <Text style={styles.inputText}>
                  {takeProfitPrice || 'Price'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputColumn}>
              <Text style={styles.inputLabel}>You gain</Text>
              <TouchableOpacity
                style={[
                  styles.inputField,
                  activeInput === 'takeProfitGain' && styles.inputFieldActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveInput('takeProfitGain');
                }}
              >
                <Text style={styles.inputPrefix}>+</Text>
                <Text style={styles.inputText}>{takeProfitGain || 'Gain'}</Text>
                <Text style={styles.inputSuffix}>%</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Percentage Buttons for Take Profit */}
          <View style={styles.percentageButtons}>
            {['+10%', '+25%', '+50%', '+100%'].map(percentage => (
              <TouchableOpacity
                key={percentage}
                style={styles.percentageButton}
                onPress={() => handlePercentageSelect(percentage, true)}
              >
                <Text style={styles.percentageButtonText}>{percentage}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stop Loss Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stop loss when</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Text style={styles.inputLabel}>Price reaches</Text>
              <TouchableOpacity
                style={[
                  styles.inputField,
                  activeInput === 'stopLossPrice' && styles.inputFieldActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveInput('stopLossPrice');
                }}
              >
                <Text style={styles.inputPrefix}>$</Text>
                <Text style={styles.inputText}>{stopLossPrice || 'Price'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputColumn}>
              <Text style={styles.inputLabel}>You lose</Text>
              <TouchableOpacity
                style={[
                  styles.inputField,
                  activeInput === 'stopLossLoss' && styles.inputFieldActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveInput('stopLossLoss');
                }}
              >
                <Text style={styles.inputPrefix}>-</Text>
                <Text style={styles.inputText}>{stopLossLoss || 'Loss'}</Text>
                <Text style={styles.inputSuffix}>%</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Percentage Buttons for Stop Loss */}
          <View style={styles.percentageButtons}>
            {['-5%', '-10%', '-25%', '-50%'].map(percentage => (
              <TouchableOpacity
                key={percentage}
                style={styles.percentageButton}
                onPress={() => handlePercentageSelect(percentage, false)}
              >
                <Text style={styles.percentageButtonText}>{percentage}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.setButton,
              !isSetEnabled && styles.setButtonDisabled,
            ]}
            onPress={handleSet}
            disabled={!isSetEnabled}
            activeOpacity={0.8}
          >
            <Text style={styles.setButtonText}>Set</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed Keypad */}
      <View style={styles.keypadSection}>
        <Keypad
          onKeyPress={handleKeypadPress}
          onLongPress={handleKeypadLongPress}
          size="medium"
          buttonBackgroundColor={colors.background.secondary}
        />
      </View>
    </SafeAreaView>
  );
}

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
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleTop: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  priceSection: {
    paddingVertical: spacing.sm,
    alignItems: 'flex-start',
  },
  priceText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  inputColumn: {
    flex: 1,
  },
  inputLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  inputField: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFieldActive: {
    borderColor: colors.accent.purple,
  },
  inputPrefix: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
    fontWeight: '500',
    marginRight: spacing.xs,
  },
  inputText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '500',
    flex: 1,
  },
  inputSuffix: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  percentageButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  percentageButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  percentageButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  setButton: {
    flex: 1,
    backgroundColor: colors.accent.purple,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  setButtonDisabled: {
    backgroundColor: colors.background.secondary,
  },
  setButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  keypadSection: {
    backgroundColor: colors.background.primary,
    paddingTop: spacing.sm,
  },
});