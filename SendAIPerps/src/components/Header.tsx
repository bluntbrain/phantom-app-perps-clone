import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../constants/colors';
import { spacing, fontSize } from '../constants/spacing';
import { haptics } from '../utils/haptics';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  rightComponent,
}) => {
  const handleBackPress = () => {
    if (onBackPress) {
      haptics.light();
      onBackPress();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Icon name="arrow-left" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.rightSection}>
        {rightComponent || <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.primary,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '600',
    flex: 2,
    textAlign: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 32,
  },
});
