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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../constants/colors';
import { spacing, fontSize, borderRadius } from '../constants/spacing';
import { haptics } from '../utils/haptics';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Keypad } from '../components';

type AddFundsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const AddFundsScreen: React.FC = () => {
  const navigation = useNavigation<AddFundsScreenNavigationProp>();
  const [amount, setAmount] = useState('25.45');
  const [usdcAmount, setUsdcAmount] = useState('24.06');

  const availableBalance = 102.11;
  const fee = 1.39;
  const minimumAmount = 30.0;

  const handleClose = () => {
    haptics.light();
    navigation.goBack();
  };

  const handleKeypadPress = (key: string) => {
    if (key === 'backspace') {
      if (amount.length > 0) {
        const newAmount = amount.slice(0, -1);
        setAmount(newAmount || '0');
        const numericAmount = parseFloat(newAmount || '0');
        setUsdcAmount((numericAmount * 0.946).toFixed(2));
      }
    } else if (key === '.') {
      if (!amount.includes('.')) {
        const newAmount = amount + key;
        setAmount(newAmount);
        const numericAmount = parseFloat(newAmount);
        setUsdcAmount((numericAmount * 0.946).toFixed(2));
      }
    } else {
      if (amount === '0') {
        setAmount(key);
        const numericAmount = parseFloat(key);
        setUsdcAmount((numericAmount * 0.946).toFixed(2));
      } else {
        const newAmount = amount + key;
        setAmount(newAmount);
        const numericAmount = parseFloat(newAmount);
        setUsdcAmount((numericAmount * 0.946).toFixed(2));
      }
    }
  };

  const handleKeypadLongPress = (key: string) => {
    if (key === 'backspace') {
      setAmount('0');
      setUsdcAmount('0.00');
    }
  };

  const isAmountValid = parseFloat(amount) >= minimumAmount;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background.primary}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Funds</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Icon name="x" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Display */}
        <View style={styles.amountSection}>
          <Text style={styles.amountText}>${amount}</Text>
          <Text style={styles.usdcText}>{usdcAmount} USDC</Text>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <View style={styles.paymentMethod}>
            <View style={styles.solanaIcon}>
              <View
                style={[
                  styles.iconPlaceholder,
                  { backgroundColor: colors.crypto.solana },
                ]}
              />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Pay SOL</Text>
            </View>
            <Text style={styles.availableText}>
              ${availableBalance.toFixed(2)} available
            </Text>
          </View>
        </View>

        {/* Minimum Amount Notice */}
        {!isAmountValid && (
          <View style={styles.minimumSection}>
            <View style={[styles.minimumNotice, styles.minimumNoticeWarning]}>
              <Text style={[styles.minimumText, styles.minimumTextWarning]}>
                Minimum ${minimumAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Keypad */}
        <Keypad
          onKeyPress={handleKeypadPress}
          onLongPress={handleKeypadLongPress}
          size="large"
          buttonBackgroundColor={colors.background.secondary}
        />

        {/* Fee Display and Add Funds Button */}
        <View style={styles.bottomSection}>
          <View style={styles.feeSection}>
            <View style={styles.feeRow}>
              <Text style={styles.feeText}>${fee.toFixed(2)} fee</Text>
              <TouchableOpacity>
                <Icon name="info" size={16} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add Funds Button */}
          <TouchableOpacity
            style={[
              styles.addFundsButton,
              !isAmountValid && styles.addFundsButtonDisabled,
            ]}
            onPress={() => {
              haptics.light();
              // TODO check how to add funds action
              console.log('Add funds pressed');
            }}
            disabled={!isAmountValid}
            activeOpacity={0.8}
          >
            <Text style={styles.addFundsButtonText}>Add Funds • ${amount}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    position: 'relative',
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.md,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
  },
  amountText: {
    color: colors.text.primary,
    fontSize: 64,
    fontWeight: '300',
    marginBottom: spacing.sm,
  },
  usdcText: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
  },
  paymentSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
  },
  solanaIcon: {
    marginRight: spacing.md,
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  availableText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  minimumSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  minimumNotice: {
    backgroundColor: colors.accent.purple,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  minimumNoticeWarning: {
    backgroundColor: colors.accent.orange,
  },
  minimumText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  minimumTextWarning: {
    color: colors.background.primary,
  },

  bottomSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  feeSection: {
    alignItems: 'center',
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  feeText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  addFundsButton: {
    backgroundColor: colors.accent.orange,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.orange,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addFundsButtonDisabled: {
    backgroundColor: colors.background.secondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  addFundsButtonText: {
    color: colors.background.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
