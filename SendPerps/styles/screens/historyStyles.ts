import { StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/spacing';

export const historyStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    color: colors.text.primary,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
  },
  filterButtonActive: {
    backgroundColor: colors.accent.purple,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  filterTextActive: {
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  transactionsList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  transactionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transactionLeft: {
    flexDirection: "row",
    flex: 1,
    gap: spacing.sm,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  transactionMeta: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  transactionRoute: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  transactionTime: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amountValue: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text.primary,
  },
  amountUsd: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  expandedContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontFamily: "monospace",
  },
  viewExplorerButton: {
    marginTop: spacing.md,
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  viewExplorerText: {
    fontSize: fontSize.sm,
    color: colors.text.accent,
    fontWeight: "500",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionFee: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  txHashRow: {
    marginTop: spacing.sm,
  },
  txHashContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  txHashLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  txHash: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    flex: 1,
  },
  explorerIcon: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});