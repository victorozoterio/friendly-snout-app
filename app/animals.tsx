import { Redirect } from 'expo-router';
import { PawPrint } from 'phosphor-react-native';
import { Text, YStack } from 'tamagui';

import { MainLayout } from '../src/components/main-layout';
import { useAuth } from '../src/contexts/auth-context';
import { colors } from '../src/theme/tokens';

export default function Animals() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href='/login' />;

  return (
    <MainLayout description='Gerencie os animais cadastrados' title='Animais'>
      <YStack flex={1} gap='$3' items='center' justify='center' px='$6'>
        <PawPrint color={colors.primary} size={48} weight='fill' />
        <Text color='$text' fontSize={18} fontWeight='700'>
          Animais
        </Text>
        <Text color='$textMuted' style={{ textAlign: 'center' }}>
          A lista e o cadastro de animais estarão disponíveis aqui.
        </Text>
      </YStack>
    </MainLayout>
  );
}
