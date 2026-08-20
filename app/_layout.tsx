import { Stack } from 'expo-router';

import { AuthProvider } from '../src/contexts/auth-context';
import { AppThemeProvider } from '../src/theme';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name='login' options={{ headerShown: false }} />
          <Stack.Screen name='index' options={{ title: 'Dashboard' }} />
          <Stack.Screen name='form' options={{ title: 'Form' }} />
          <Stack.Screen name='profile' options={{ title: 'Profile' }} />
          <Stack.Screen name='register' options={{ title: 'Register' }} />
        </Stack>
      </AuthProvider>
    </AppThemeProvider>
  );
}
