import { Redirect } from 'expo-router';
import { PillIcon } from 'phosphor-react-native';
import { Text, YStack } from 'tamagui';

import { MainLayout } from '../src/components/main-layout';
import { useAuth } from '../src/contexts/auth-context';
import { routes } from '../src/routes';
import { colors } from '../src/theme/tokens';

export default function Medicines() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href={routes.login} />;

  return (
    <MainLayout description='Acompanhe os medicamentos' title='Medicamentos'>
      <YStack flex={1} gap='$3' items='center' justify='center' px='$6'>
        <PillIcon color={colors.primary} size={48} weight='fill' />
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
