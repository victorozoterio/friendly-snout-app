import { createTokens } from 'tamagui';
import { palette } from './colors';

export const colors = {
  primary: palette.blue700,
  primaryPressed: palette.blue800,
  secondary: palette.blue800,
  background: palette.neutral100,
  surface: palette.neutral0,
  surfaceMuted: palette.neutral50,
  text: palette.blue950,
  textMuted: palette.neutral600,
  border: palette.blue200,
  placeholder: palette.neutral500,
  error: palette.red500,
  warning: palette.yellow500,
  success: palette.green500,
  white: palette.neutral0,
  black: palette.blue950,
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  true: 16,
} as const;

export const sizes = {
  0: 0,
  1: 20,
  2: 28,
  3: 36,
  4: 44,
  5: 52,
  6: 60,
  8: 72,
  10: 88,
  12: 104,
  16: 136,
  true: 44,
} as const;

export const radii = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  true: 8,
} as const;

export const zIndices = {
  0: 0,
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
  6: 60,
  8: 80,
  10: 100,
  12: 120,
  16: 160,
  true: 0,
} as const;

export const tokens = createTokens({
  color: colors,
  space: spacing,
  size: sizes,
  radius: radii,
  zIndex: zIndices,
});
