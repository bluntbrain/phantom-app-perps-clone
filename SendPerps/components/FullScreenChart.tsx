import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing, fontSize } from '../constants/spacing';

interface FullScreenChartProps {
  visible: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
  renderCandlesticks: (isFullScreen: boolean) => React.ReactNode;
  currentInterval?: string;
  onIntervalChange?: (interval: string) => void;
}

export const FullScreenChart: React.FC<FullScreenChartProps> = ({
  visible,
  onClose,
  symbol,
  currentPrice,
  renderCandlesticks,
  currentInterval = '1m',
  onIntervalChange,
}) => {
  const intervals = ['1m', '5m', '15m', '1h', '4h', '1d'];
  
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.fullScreenContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background.primary}
        />

        <View style={styles.fullScreenHeader}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.fullScreenTitle}>
            <Text style={styles.fullScreenSymbol}>{symbol}</Text>
            <Text style={styles.fullScreenPrice}>
              ${currentPrice.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.advancedControls}>
          {intervals.map((intervalOption) => (
            <TouchableOpacity
              key={intervalOption}
              style={[
                styles.controlButton,
                currentInterval === intervalOption && styles.activeControl,
              ]}
              onPress={() => onIntervalChange?.(intervalOption)}
            >
              <Text
                style={[
                  styles.controlButtonText,
                  currentInterval === intervalOption && styles.activeControlText,
                ]}
              >
                {intervalOption.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.fullScreenChartContainer}>
          {renderCandlesticks(true)}
        </View>

        <View style={styles.advancedFeatures}>
          <TouchableOpacity style={styles.featureButton}>
            <Ionicons name="trending-up" size={16} color={colors.accent.green} />
            <Text style={styles.featureText}>Indicators</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureButton}>
            <Ionicons name="layers-outline" size={16} color={colors.accent.blue} />
            <Text style={styles.featureText}>Overlays</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureButton}>
            <Ionicons name="create-outline" size={16} color={colors.accent.purple} />
            <Text style={styles.featureText}>Draw</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureButton}>
            <Ionicons name="save-outline" size={16} color={colors.accent.orange} />
            <Text style={styles.featureText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  fullScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  closeButton: {
    padding: spacing.sm,
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  fullScreenTitle: {
    alignItems: 'center',
  },
  fullScreenSymbol: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
  fullScreenPrice: {
    color: colors.text.primary,
    fontSize: fontSize.xxl,
    fontWeight: '600',
  },
  settingsButton: {
    padding: spacing.sm,
  },
  advancedControls: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  controlButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
  },
  activeControl: {
    backgroundColor: colors.accent.blue,
  },
  controlButtonText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  activeControlText: {
    color: colors.background.primary,
  },
  fullScreenChartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advancedFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  featureButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureText: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
  },
});