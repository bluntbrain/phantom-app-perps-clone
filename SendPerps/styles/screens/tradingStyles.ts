import { StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/spacing';

export const tradingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cryptoIcon: {
    marginRight: spacing.sm,
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
  },
  headerText: {
    alignItems: "flex-start",
  },
  symbolText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  typeText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  fixedButtonContainer: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    paddingTop: spacing.sm,
  },
  balanceSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
  balanceRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  balanceAmount: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  infoText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
  tradingButtons: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  tradingButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  longButton: {
    backgroundColor: colors.accent.purple,
  },
  shortButton: {
    backgroundColor: colors.accent.purple,
  },
  tradingButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
});