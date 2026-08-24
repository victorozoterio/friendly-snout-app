import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AuthProvider } from '../src/contexts/auth-context';
import { AppThemeProvider } from '../src/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#061827' : '#E6EEF6';

  return (
    <AppThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ animation: 'fade', contentStyle: { backgroundColor } }}>
          <Stack.Screen name='login' options={{ headerShown: false }} />
          <Stack.Screen name='index' options={{ headerShown: false }} />
          <Stack.Screen name='animals' options={{ headerShown: false }} />
          <Stack.Screen name='animal-form' options={{ headerShown: false }} />
          <Stack.Screen name='medicines' options={{ headerShown: false }} />
          <Stack.Screen name='form' options={{ title: 'Form' }} />
          <Stack.Screen name='profile' options={{ title: 'Profile' }} />
          <Stack.Screen name='register' options={{ title: 'Register' }} />
        </Stack>
      </AuthProvider>
    </AppThemeProvider>
  );
}
