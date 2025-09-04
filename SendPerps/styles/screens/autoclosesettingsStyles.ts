import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, fontSize, borderRadius } from "../../constants/spacing";

export const autoclosesettingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleTop: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  priceSection: {
    paddingVertical: spacing.sm,
    alignItems: 'flex-start',
  },
  priceText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  inputColumn: {
    flex: 1,
  },
  inputLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  inputField: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFieldActive: {
    borderColor: colors.accent.purple,
  },
  inputPrefix: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
    fontWeight: '500',
    marginRight: spacing.xs,
  },
  inputText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '500',
    flex: 1,
  },
  inputSuffix: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  percentageButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  percentageButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  percentageButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  setButton: {
    flex: 1,
    backgroundColor: colors.accent.purple,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  setButtonDisabled: {
    backgroundColor: colors.background.secondary,
  },
  setButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  keypadSection: {
    backgroundColor: colors.background.primary,
    paddingTop: spacing.sm,
  },
});