import { createFont } from 'tamagui';

const fontSizes = {
  1: 12,
  2: 13,
  3: 14,
  4: 15,
  5: 16,
  6: 18,
  7: 22,
  8: 26,
  9: 30,
  10: 40,
} as const;

const fontWeights = {
  1: '400',
  2: '400',
  3: '400',
  4: '400',
  5: '500',
  6: '500',
  7: '600',
  8: '600',
  9: '700',
  10: '700',
} as const;

const lineHeights = {
  1: 16,
  2: 18,
  3: 20,
  4: 22,
  5: 24,
  6: 27,
  7: 33,
  8: 38,
  9: 44,
  10: 56,
} as const;

export const typography = {
  family: 'System',
  sizes: fontSizes,
  weights: fontWeights,
  lineHeights,
} as const;

export const bodyFont = createFont({
  family: typography.family,
  size: fontSizes,
  weight: fontWeights,
  lineHeight: lineHeights,
  letterSpacing: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
  },
});

export const headingFont = bodyFont;
