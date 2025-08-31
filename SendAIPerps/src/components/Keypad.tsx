import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../constants/colors';
import { spacing, fontSize, borderRadius } from '../constants/spacing';
import { haptics } from '../utils/haptics';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onLongPress?: (key: string) => void;
  size?: 'small' | 'medium' | 'large';
  buttonBackgroundColor?: string;
}

export const Keypad: React.FC<KeypadProps> = ({
  onKeyPress,
  onLongPress,
  size = 'medium',
  buttonBackgroundColor = colors.background.secondary,
}) => {
  const handleKeyPress = (key: string) => {
    haptics.light();
    onKeyPress(key);
  };

  const handleLongPress = (key: string) => {
    haptics.medium();
    if (onLongPress) {
      onLongPress(key);
    }
  };

  const renderKeypadButton = (key: string, isSpecial = false) => {
    const isBackspace = key === 'backspace';

    const buttonStyle = [
      styles.keypadButton,
      { backgroundColor: isSpecial ? 'transparent' : buttonBackgroundColor },
      size === 'small' && styles.keypadButtonSmall,
      size === 'large' && styles.keypadButtonLarge,
    ];

    const textStyle = [
      styles.keypadText,
      size === 'small' && styles.keypadTextSmall,
      size === 'large' && styles.keypadTextLarge,
      isSpecial && styles.specialText,
    ];

    return (
      <TouchableOpacity
        key={key}
        style={buttonStyle}
        onPress={() => handleKeyPress(key)}
        onLongPress={isBackspace ? () => handleLongPress(key) : undefined}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        {isBackspace ? (
          <Icon
            name="delete"
            size={size === 'small' ? 20 : size === 'large' ? 24 : 22}
            color={colors.text.primary}
          />
        ) : (
          <Text style={textStyle}>{key}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.keypadContainer,
        size === 'small' && styles.keypadContainerSmall,
        size === 'large' && styles.keypadContainerLarge,
      ]}
    >
      <View style={styles.keypadRow}>
        {renderKeypadButton('1')}
        {renderKeypadButton('2')}
        {renderKeypadButton('3')}
      </View>
      <View style={styles.keypadRow}>
        {renderKeypadButton('4')}
        {renderKeypadButton('5')}
        {renderKeypadButton('6')}
      </View>
      <View style={styles.keypadRow}>
        {renderKeypadButton('7')}
        {renderKeypadButton('8')}
        {renderKeypadButton('9')}
      </View>
      <View style={styles.keypadRow}>
        {renderKeypadButton('.')}
        {renderKeypadButton('0')}
        {renderKeypadButton('backspace', true)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  keypadContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  keypadContainerSmall: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  keypadContainerLarge: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keypadButton: {
    width: 55,
    height: 55,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadButtonSmall: {
    width: 50,
    height: 50,
  },
  keypadButtonLarge: {
    width: 65,
    height: 65,
  },

  keypadText: {
    color: colors.text.primary,
    fontSize: fontSize.xxl,
    fontWeight: '400',
  },
  keypadTextSmall: {
    fontSize: fontSize.xl,
  },
  keypadTextLarge: {
    fontSize: 32,
  },
  specialText: {
    color: colors.text.secondary,
  },
});
