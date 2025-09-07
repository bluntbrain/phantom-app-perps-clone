import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { spacing, borderRadius, fontSize } from '../constants/spacing';
import { haptics } from '../utils/haptics';

type TimePeriod = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

interface TimePeriodSelectorProps {
  onPeriodChange?: (period: TimePeriod) => void;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  onPeriodChange,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1m');

  const periods: TimePeriod[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

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
    paddingVertical: spacing.xs,
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