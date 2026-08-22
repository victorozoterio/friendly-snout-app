import { Redirect } from 'expo-router';
import { Pill } from 'phosphor-react-native';
import { Text, YStack } from 'tamagui';

import { MainLayout } from '../src/components/main-layout';
import { useAuth } from '../src/contexts/auth-context';
import { colors } from '../src/theme/tokens';

export default function Medicines() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href='/login' />;

  return (
    <MainLayout description='Acompanhe os medicamentos' title='Medicamentos'>
      <YStack flex={1} gap='$3' items='center' justify='center' px='$6'>
        <Pill color={colors.primary} size={48} weight='fill' />
        <Text color='$text' fontSize={18} fontWeight='700'>
          Medicamentos
        </Text>
        <Text color='$textMuted' style={{ textAlign: 'center' }}>
          O controle de medicamentos estará disponível aqui.
        </Text>
      </YStack>
    </MainLayout>
  );
}
