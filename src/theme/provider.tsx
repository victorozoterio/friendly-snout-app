import type { PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig } from './config';

export function AppThemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
      {children}
    </TamaguiProvider>
  );
}
