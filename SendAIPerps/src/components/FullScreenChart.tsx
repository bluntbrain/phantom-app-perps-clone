import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../constants/colors';
import { spacing, fontSize } from '../constants/spacing';

interface FullScreenChartProps {
  visible: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
  renderCandlesticks: (isFullScreen: boolean) => React.ReactNode;
}

export const FullScreenChart: React.FC<FullScreenChartProps> = ({
  visible,
  onClose,
  symbol,
  currentPrice,
  renderCandlesticks,
}) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.fullScreenContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background.primary}
        />

        {/* Full Screen Header */}
        <View style={styles.fullScreenHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.fullScreenTitle}>
            <Text style={styles.fullScreenSymbol}>{symbol}</Text>
            <Text style={styles.fullScreenPrice}>
              ${currentPrice.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity style={styles.settingsButton}>
            <Icon name="settings" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Advanced Chart Features */}
        <View style={styles.advancedControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>1M</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>5M</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.activeControl]}
          >
            <Text style={[styles.controlButtonText, styles.activeControlText]}>
              15M
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>1H</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>4H</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>1D</Text>
          </TouchableOpacity>
        </View>

        {/* Full Screen Chart */}
        <View style={styles.fullScreenChartContainer}>
          {renderCandlesticks(true)}
        </View>

        {/* Advanced Features */}
        <View style={styles.advancedFeatures}>
          <TouchableOpacity style={styles.featureButton}>
            <Icon name="trending-up" size={16} color={colors.accent.green} />
            <Text style={styles.featureText}>Indicators</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureButton}>
            <Icon name="layers" size={16} color={colors.accent.blue} />
            <Text style={styles.featureText}>Overlays</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureButton}>
            <Icon name="edit-3" size={16} color={colors.accent.purple} />
            <Text style={styles.featureText}>Draw</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureButton}>
            <Icon name="save" size={16} color={colors.accent.orange} />
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
  closeButton: {
    padding: spacing.sm,
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
