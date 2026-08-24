import { Redirect } from 'expo-router';
import { PawPrint } from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, YStack } from 'tamagui';

import { useAppColors } from '../src/components/main-layout';
import { ScreenHeader } from '../src/components/screen-header';
import { useAuth } from '../src/contexts/auth-context';

export default function AnimalForm() {
  const { status } = useAuth();
  const colors = useAppColors();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href='/login' />;

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScreenHeader description='Cadastre um novo animal' title='Novo animal' />
      <YStack flex={1} gap='$3' items='center' justify='center' px='$6'>
        <PawPrint color={colors.primary} size={48} weight='fill' />
        <Text fontSize={18} fontWeight='700' style={{ color: colors.text }}>
          Cadastro de animal
        </Text>
        <Text style={{ color: colors.muted, textAlign: 'center' }}>
          O formulário de cadastro estará disponível aqui.
        </Text>
      </YStack>
    </SafeAreaView>
  );
}
