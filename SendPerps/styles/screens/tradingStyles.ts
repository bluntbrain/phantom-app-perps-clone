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
    fontSize: fontSize.xl,
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
    paddingBottom: 0,
  },
  fixedButtonContainer: {
    backgroundColor: colors.background.primary,
    paddingTop: spacing.sm,
  },
  balanceSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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
    paddingVertical: spacing.sm,
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
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    height: 52,
  },
  longButton: {
    backgroundColor: colors.accent.purple,
  },
  shortButton: {
    backgroundColor: colors.accent.purple,
  },
  modifyButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  closeLongButton: {
    backgroundColor: colors.accent.purple,
  },
  closeShortButton: {
    backgroundColor: colors.accent.purple,
  },
  tradingButtonText: {
    color: colors.text.black,
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
  // Position Section Styles
  positionSection: {
    marginTop: spacing.md,
  },
  positionSectionTitle: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  positionBox: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: 'center',
  },
  positionBoxLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    marginBottom: 4,
    textAlign: 'center',
  },
  positionBoxValue: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
});