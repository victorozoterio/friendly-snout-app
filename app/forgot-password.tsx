import { Redirect, useRouter } from 'expo-router';
import { Button, Text, YStack } from 'tamagui';

import { PublicAuthLayout, PublicAuthLogo } from '../src/components/public-auth-layout';
import { useAuth } from '../src/contexts/auth-context';
import { routes } from '../src/routes';

export default function ForgotPassword() {
  const router = useRouter();
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'authenticated') return <Redirect href={routes.home} />;

  return (
    <PublicAuthLayout>
      <YStack gap='$5' width='100%'>
        <PublicAuthLogo />

        <YStack gap='$6' items='center'>
          <Text color='$primary' fontSize={24} style={{ textAlign: 'center' }}>
            Entre em contato com o suporte técnico!
          </Text>

          <Button
            bg='$primary'
            color='$white'
            fontSize={16}
            fontWeight='700'
            onPress={() => router.replace(routes.login)}
            pressStyle={{ bg: '$secondary' }}
            rounded='$2'
            size='$6'
            width='100%'
          >
            Voltar para o login
          </Button>
        </YStack>
      </YStack>
    </PublicAuthLayout>
  );
}
