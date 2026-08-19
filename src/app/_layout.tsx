import { Stack } from 'expo-router';

import { AppThemeProvider } from '../theme';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <Stack />
    </AppThemeProvider>
  );
}
