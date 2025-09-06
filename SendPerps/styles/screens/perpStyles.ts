import { StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/spacing';

export const perpStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: "600",
  },
  balanceContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  balanceLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.lg,
  },
  balanceAmount: {
    color: colors.text.primary,
    fontSize: 48,
    fontWeight: '300',
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    minWidth: 120,
    justifyContent: 'center',
  },
  addFundsButton: {
    backgroundColor: colors.accent.purple,
  },
  actionButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '500',
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
    gap: spacing.lg,
  },
  tableHeaderText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  sortIcon: {
    color: colors.text.accent,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  list: {
    flex: 1,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  availableLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  availableAmount: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  transferLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  transferAmount: {
    color: colors.text.primary,
    fontSize: 48,
    fontWeight: '300',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  maxButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  maxButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: colors.accent.green,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.background.secondary,
    opacity: 0.5,
  },
  confirmButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});