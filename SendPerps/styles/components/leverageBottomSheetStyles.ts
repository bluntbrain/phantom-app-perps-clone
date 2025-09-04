import { StyleSheet, Dimensions } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, fontSize, borderRadius } from "../../constants/spacing";

const { width, height } = Dimensions.get("window");
const SHEET_HEIGHT = height * 0.4;

export const leverageBottomSheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropTouch: {
    flex: 1,
  },
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.text.secondary,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: "600",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  minMaxButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: "center",
  },
  minMaxText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  currentLeverageDisplay: {
    alignItems: "center",
    justifyContent: "center",
  },
  currentLeverageText: {
    color: colors.text.primary,
    fontSize: 48,
    fontWeight: "300",
    fontFamily: "monospace",
  },
  sliderContainer: {
    flex: 1,
    justifyContent: "center",
  },
  sliderContent: {
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
  },
  leverageItem: {
    alignItems: "center",
    marginHorizontal: 3,
    paddingHorizontal: 8,
    width: 34,
  },
  selectedLeverageItem: {},
  textContainer: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  leverageText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  leverageIndicator: {
    width: 1,
    height: 40,
    backgroundColor: colors.text.secondary,
    opacity: 0.3,
  },
  selectedIndicator: {
    backgroundColor: colors.text.primary,
    width: 2,
    height: 60,
    opacity: 1,
  },
  doneButton: {
    backgroundColor: colors.accent.purple,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  doneButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
});

export const LEVERAGE_SHEET_HEIGHT = SHEET_HEIGHT;