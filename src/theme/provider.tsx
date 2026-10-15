import type { PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import { AppDialogProvider } from '../contexts/app-dialog-context';
import { tamaguiConfig } from './config';

export function AppThemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
      <AppDialogProvider>{children}</AppDialogProvider>
    </TamaguiProvider>
  );
}
