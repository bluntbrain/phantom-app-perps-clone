import { StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/spacing';

export const homeStyles = StyleSheet.create({
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
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: "600",
  },
  balanceContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  balanceLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  balanceAmount: {
    color: colors.text.primary,
    fontSize: fontSize.xxxl,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  balanceCurrency: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
    fontWeight: '500',
  },
  balanceSubtext: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  balanceBreakdown: {
    marginTop: spacing.xs,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
  },
  filterButtonActive: {
    backgroundColor: colors.background.tertiary,
  },
  filterText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  filterTextActive: {
    color: colors.text.primary,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  tableHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeaderText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  sortIcon: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
  },
  list: {
    flex: 1,
  },
  walletContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  walletInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  walletAddress: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  logoutButton: {
    padding: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
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