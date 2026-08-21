import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui } from 'tamagui';

import { bodyFont, headingFont } from './fonts';
import { themes } from './themes';
import { tokens } from './tokens';

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  tokens,
  themes,
  fonts: {
    ...defaultConfig.fonts,
    body: bodyFont,
    heading: headingFont,
  },
});

export default tamaguiConfig;

export type TamaguiConf = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends TamaguiConf {}
}
