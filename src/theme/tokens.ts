import { createTokens } from 'tamagui';

export const colors = {
  primary: '#1371AF',
  primaryPressed: '#0B4F80',
  secondary: '#0B4F80',
  background: '#E6EEF6',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F8FC',
  text: '#082038',
  textMuted: '#5D7186',
  border: '#C9D7E6',
  placeholder: '#8FA6BF',
  error: '#E74C3C',
  warning: '#F4B400',
  success: '#2ECC71',
  white: '#FFFFFF',
  black: '#082038',
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
