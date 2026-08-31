/** Paleta única de cores da aplicação. Cores literais devem ser declaradas somente neste módulo. */
export const palette = {
  blue100: '#D8E5F1',
  blue200: '#B9CDDF',
  blue300: '#9CB3C7',
  blue400: '#74B7E2',
  blue500: '#347BFF',
  blue600: '#176FEB',
  blue700: '#1371AF',
  blue800: '#0B4F80',
  blue900: '#1C5478',
  blue950: '#082038',
  blueDark950: '#061827',
  blueDark900: '#081A2B',
  blueDark800: '#0C2942',
  blueDark700: '#102B42',
  blueDark600: '#103651',
  blueDark500: '#173A57',
  blueDark400: '#2B5270',
  blueDark300: '#2D4B63',
  green500: '#2ECC71',
  green600: '#168A54',
  green700: '#106E3D',
  red400: '#F87171',
  red500: '#E74C3C',
  red600: '#C0392B',
  red700: '#A83232',
  yellow500: '#F4B400',
  yellow600: '#F6B90A',
  yellow700: '#B77900',
  neutral0: '#FFFFFF',
  neutral50: '#F4F8FC',
  neutral100: '#E6EEF6',
  neutral200: '#DCEAF6',
  neutral300: '#D2DBE4',
  neutral500: '#8FA6BF',
  neutral600: '#5D7186',
  neutral650: '#526C84',
  neutral700: '#A3B5C8',
  black: '#000000',
} as const;

export type AppColors = {
  background: string;
  border: string;
  card: string;
  cardMuted: string;
  danger: string;
  muted: string;
  primary: string;
  success: string;
  text: string;
  warning: string;
};

export const appColors: Record<'dark' | 'light', AppColors> = {
  dark: {
    background: palette.blueDark950,
    border: palette.blueDark400,
    card: palette.blueDark800,
    cardMuted: palette.blueDark600,
    danger: palette.red400,
    muted: palette.neutral700,
    primary: palette.blue500,
    success: palette.green500,
    text: palette.neutral50,
    warning: palette.yellow600,
  },
  light: {
    background: palette.neutral100,
    border: palette.blue200,
    card: palette.neutral50,
    cardMuted: palette.neutral200,
    danger: palette.red600,
    muted: palette.neutral650,
    primary: palette.blue600,
    success: palette.green600,
    text: palette.blue950,
    warning: palette.yellow700,
  },
};

export const actionColors = {
  attachment: palette.green700,
  destructive: palette.red700,
  medicine: palette.blue900,
} as const;

export const effectColors = {
  darkModalOverlay: 'rgba(2, 12, 22, 0.65)',
  imageHeaderButton: 'rgba(12, 32, 54, 0.72)',
  imageHeaderButtonBorder: 'rgba(255, 255, 255, 0.2)',
  modalOverlay: 'rgba(2, 12, 22, 0.72)',
  previewOverlay: 'rgba(0, 0, 0, 0.9)',
  surfaceGlassDark: 'rgba(12, 41, 66, 0.82)',
  surfaceGlassLight: 'rgba(244, 248, 252, 0.84)',
  surfaceGlassBorderDark: 'rgba(204, 231, 255, 0.19)',
  surfaceGlassBorderLight: 'rgba(37, 92, 133, 0.18)',
} as const;
