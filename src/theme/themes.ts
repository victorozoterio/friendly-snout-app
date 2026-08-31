import { defaultConfig } from '@tamagui/config/v5';
import { palette } from './colors';
import { colors, tokens } from './tokens';

const sharedTheme = {
  primary: tokens.color.primary,
  primaryPressed: tokens.color.primaryPressed,
  secondary: tokens.color.secondary,
  error: tokens.color.error,
  warning: tokens.color.warning,
  success: tokens.color.success,
  border: tokens.color.border,
  placeholder: tokens.color.placeholder,
  surface: tokens.color.surface,
  surfaceMuted: tokens.color.surfaceMuted,
};

export const themes = {
  ...defaultConfig.themes,
  light: {
    ...defaultConfig.themes.light,
    ...sharedTheme,
    background: colors.background,
    backgroundHover: colors.surfaceMuted,
    backgroundPress: palette.blue100,
    color: colors.text,
    colorHover: colors.secondary,
    colorPress: colors.secondary,
    colorFocus: colors.primary,
    borderColor: colors.border,
    borderColorHover: colors.primary,
    borderColorFocus: colors.primary,
    placeholderColor: colors.placeholder,
  },
  dark: {
    ...defaultConfig.themes.dark,
    ...sharedTheme,
    background: palette.blueDark900,
    backgroundHover: palette.blueDark700,
    backgroundPress: palette.blueDark500,
    color: palette.neutral50,
    colorHover: palette.neutral0,
    colorPress: palette.neutral0,
    colorFocus: palette.blue400,
    borderColor: palette.blueDark300,
    borderColorHover: palette.blue400,
    borderColorFocus: palette.blue400,
    placeholderColor: palette.blue300,
    surface: palette.blueDark700,
    surfaceMuted: palette.blueDark500,
  },
};
