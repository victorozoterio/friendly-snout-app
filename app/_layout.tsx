import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AuthProvider } from '../src/contexts/auth-context';
import { routeNames } from '../src/routes';
import { AppThemeProvider, appColors } from '../src/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = appColors[colorScheme === 'dark' ? 'dark' : 'light'].background;

  return (
    <AppThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ animation: 'fade', contentStyle: { backgroundColor } }}>
          <Stack.Screen name={routeNames.login} options={{ headerShown: false }} />
          <Stack.Screen name={routeNames.home} options={{ headerShown: false }} />
          <Stack.Screen name={routeNames.animals} options={{ headerShown: false }} />
          <Stack.Screen name={routeNames.animalDetails} options={{ headerShown: false }} />
          <Stack.Screen name={routeNames.animalAttachments} options={{ headerShown: false }} />
          <Stack.Screen name={routeNames.animalMedicines} options={{ headerShown: false }} />
          <Stack.Screen name={routeNames.createMedicineApplication} options={{ headerShown: false }} />
          <Stack.Screen name={routeNames.animalForm} options={{ headerShown: false }} />
          <Stack.Screen name={routeNames.editAnimal} options={{ headerShown: false }} />
          <Stack.Screen name={routeNames.medicines} options={{ headerShown: false }} />
          <Stack.Screen name={routeNames.medicineForm} options={{ headerShown: false }} />
          <Stack.Screen name={routeNames.editMedicine} options={{ headerShown: false }} />
          <Stack.Screen name={routeNames.medicineBrands} options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </AppThemeProvider>
  );
}
