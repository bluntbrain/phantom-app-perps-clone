import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, fontSize, borderRadius } from "../../constants/spacing";

export const addfundsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  mainContent: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
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
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: "600",
    flex: 1,
    textAlign: "left",
  },
  amountSection: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
  },
  amountLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  amountText: {
    color: colors.text.primary,
    fontSize: 64,
    fontWeight: "300",
  },
  solText: {
    color: colors.text.primary,
    fontSize: fontSize.xxl,
    fontWeight: "400",
    marginBottom: 8,
  },
  usdcRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 24,
  },
  usdcValue: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
  },
  solPriceText: {
    color: colors.text.tertiary,
    fontSize: fontSize.sm,
  },
  warningContainer: {
    minHeight: 60, // Fixed height to prevent layout shift
    justifyContent: "center",
  },
  minimumSection: {
    paddingHorizontal: spacing.md,
  },
  minimumNotice: {
    backgroundColor: colors.accent.purple,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  minimumNoticeWarning: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  minimumText: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  minimumTextWarning: {
    color: colors.text.secondary,
  },
  keypadSection: {
    backgroundColor: colors.background.primary,
    paddingTop: spacing.sm,
  },
  bottomSection: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  addFundsButton: {
    backgroundColor: colors.accent.orange,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "600",
  },
  feeEstimateContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    marginHorizontal: spacing.sm,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feeTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: 0,
  },
  feeLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  feeValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  feeAmount: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: "500",
  },
  feeUsd: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  feeEta: {
    fontSize: fontSize.sm,
    color: colors.accent.green,
    fontWeight: "500",
  },
  feeTotalLabel: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    fontWeight: "600",
  },
  feeTotalAmount: {
    fontSize: fontSize.md,
    color: colors.text.accent,
    fontWeight: "600",
  },
});