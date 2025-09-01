/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { colors } from '../constants/colors';

export function useThemeColor(
  props: { light?: string; dark?: string }
) {
  const colorFromProps = props.dark;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors.text.primary;
  }
}
