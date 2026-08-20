import { Stack } from 'expo-router';

import { AuthProvider } from '../contexts/auth-context';
import { AppThemeProvider } from '../theme';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name='login' options={{ headerShown: false }} />
          <Stack.Screen name='dashboard' options={{ title: 'Dashboard' }} />
          <Stack.Screen name='home' options={{ title: 'Home' }} />
        </Stack>
      </AuthProvider>
    </AppThemeProvider>
  );
}
