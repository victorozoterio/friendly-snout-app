import { defaultConfig } from '@tamagui/config/v5';
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
    backgroundPress: '#D8E5F1',
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
    background: '#081A2B',
    backgroundHover: '#102B42',
    backgroundPress: '#173A57',
    color: '#F4F8FC',
    colorHover: '#FFFFFF',
    colorPress: '#FFFFFF',
    colorFocus: '#74B7E2',
    borderColor: '#2D4B63',
    borderColorHover: '#74B7E2',
    borderColorFocus: '#74B7E2',
    placeholderColor: '#9CB3C7',
    surface: '#102B42',
    surfaceMuted: '#173A57',
  },
};
