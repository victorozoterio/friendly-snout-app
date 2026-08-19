import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui } from 'tamagui';

export const tamaguiConfig = createTamagui(defaultConfig);

export default tamaguiConfig;

export type TamaguiConf = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends TamaguiConf {}
}

declare module '@tamagui/web' {
  interface TamaguiCustomConfig extends TamaguiConf {}
}

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends TamaguiConf {}
}
