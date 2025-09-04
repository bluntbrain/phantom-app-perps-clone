import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    padding: 24,
    borderRadius: 80,
    backgroundColor: colors.background.secondary,
    shadowColor: colors.text.accent,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  logo: {
    width: 120,
    height: 120,
  },
});