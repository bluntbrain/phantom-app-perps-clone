import React from 'react';
import { View, Text } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { colors } from '../constants/colors';
import { spacing, fontSize, borderRadius } from '../constants/spacing';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors.accent.green,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        marginHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.primary,
      }}
      contentContainerStyle={{ paddingHorizontal: spacing.md }}
      text1Style={{
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
      }}
      text2Style={{
        fontSize: fontSize.sm,
        color: colors.text.secondary,
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: colors.accent.red,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        marginHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.primary,
      }}
      contentContainerStyle={{ paddingHorizontal: spacing.md }}
      text1Style={{
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
      }}
      text2Style={{
        fontSize: fontSize.sm,
        color: colors.text.secondary,
      }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors.accent.blue,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        marginHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.primary,
      }}
      contentContainerStyle={{ paddingHorizontal: spacing.md }}
      text1Style={{
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
      }}
      text2Style={{
        fontSize: fontSize.sm,
        color: colors.text.secondary,
      }}
    />
  ),
  warning: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors.accent.orange,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        marginHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.primary,
      }}
      contentContainerStyle={{ paddingHorizontal: spacing.md }}
      text1Style={{
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
      }}
      text2Style={{
        fontSize: fontSize.sm,
        color: colors.text.secondary,
      }}
    />
  ),
};