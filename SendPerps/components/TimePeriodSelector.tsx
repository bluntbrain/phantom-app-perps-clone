import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize } from '../constants/spacing';
import { haptics } from '../utils/haptics';

type TimePeriod = '1H' | '1D' | '1W' | '1M' | 'YTD' | 'ALL';

interface TimePeriodSelectorProps {
  onPeriodChange?: (period: TimePeriod) => void;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  onPeriodChange,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1H');

  const periods: TimePeriod[] = ['1H', '1D', '1W', '1M', 'YTD', 'ALL'];

  const handlePeriodPress = (period: TimePeriod) => {
    haptics.selection();
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  return (
    <View style={styles.container}>
      {periods.map(period => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.selectedPeriod,
          ]}
          onPress={() => handlePeriodPress(period)}
        >
          <Text
            style={[
              styles.periodText,
              selectedPeriod === period && styles.selectedPeriodText,
            ]}
          >
            {period}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  periodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    minWidth: 40,
    alignItems: 'center',
  },
  selectedPeriod: {
    backgroundColor: colors.background.tertiary,
  },
  periodText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  selectedPeriodText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});