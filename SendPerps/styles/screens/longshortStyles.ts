import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, fontSize, borderRadius } from "../../constants/spacing";

export const longshortStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
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
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
  },
  placeholder: {
    width: 32,
  },
  sizeDisplaySection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sizeText: {
    color: colors.text.primary,
    fontSize: 48,
    fontWeight: '300',
    marginBottom: spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  balanceText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
  maxButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  maxButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  addFundsLink: {
    marginTop: spacing.xs,
  },
  addFundsText: {
    color: colors.accent.blue,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  controlsCard: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginVertical: spacing.xs,
  },
  controlLabel: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  leverageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  leverageText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sizeValue: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  customSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  customSwitchTrack: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  customSwitchTrackActive: {
    backgroundColor: colors.accent.green,
  },
  customSwitchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text.primary,
    alignSelf: 'flex-start',
  },
  customSwitchThumbActive: {
    alignSelf: 'flex-end',
  },
  chevronIcon: {
    marginLeft: spacing.xs,
  },

  reviewSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  reviewButton: {
    backgroundColor: colors.accent.purple,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonDisabled: {
    backgroundColor: colors.background.secondary,
  },
  reviewButtonError: {
    backgroundColor: colors.accent.red,
  },
  reviewButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  reviewButtonErrorText: {
    color: colors.text.primary,
  },

  disclosureSection: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  disclosureText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    textDecorationLine: 'underline',
  },
});