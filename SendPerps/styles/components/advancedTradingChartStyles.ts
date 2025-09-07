import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, fontSize, borderRadius } from "../../constants/spacing";

export const advancedTradingChartStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    marginTop: spacing.sm,
    marginBottom: 0,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  priceInfo: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  symbolText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  updateTimeText: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontWeight: "500",
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  priceText: {
    color: colors.text.primary,
    fontSize: 48,
    fontWeight: "600",
    marginBottom: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  changeText: {
    fontSize: fontSize.lg,
    fontWeight: "500",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  fullScreenButton: {
    padding: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: 6,
  },
  ohlcInfo: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.blue,
  },
  ohlcCompact: {
    gap: spacing.xs,
  },
  ohlcText: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.2,
  },
  ohlcLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  ohlcValue: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  ohlcSeparator: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
  },
  highValue: {
    color: colors.accent.green,
  },
  lowValue: {
    color: colors.accent.red,
  },
  greenValue: {
    color: colors.accent.green,
  },
  redValue: {
    color: colors.accent.red,
  },
  volumeCompact: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontFamily: "monospace",
  },
  timeStamp: {
    color: colors.accent.blue,
    fontSize: fontSize.xs,
  },
  chartContainer: {
    marginHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  instructions: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  instructionText: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    textAlign: "center",
    fontStyle: "italic",
  },
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
  loadingContent: {
    alignItems: "center",
    gap: spacing.xs,
  },
  loadingText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    textAlign: "center",
    fontWeight: "600",
  },
  loadingSubtext: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    textAlign: "center",
    fontStyle: "italic",
  },
  errorContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
  errorText: {
    color: colors.accent.red,
    fontSize: fontSize.md,
    textAlign: "center",
  },
});