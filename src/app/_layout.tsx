import { Stack } from 'expo-router';
import { AppThemeProvider } from '../theme';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <Stack>
        <Stack.Screen name='login' options={{ title: 'Login' }} />
        <Stack.Screen name='home' options={{ title: 'Home' }} />
      </Stack>
    </AppThemeProvider>
  );
}
