import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Label, Text, YStack } from 'tamagui';

import { useAuth } from '../src/contexts/auth-context';

const Logo = require('../assets/logo.png') as number;

export default function Login() {
  const router = useRouter();
  const { signIn, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (status === 'loading') return null;
  if (status === 'authenticated') return <Redirect href={'/' as never} />;

  const handleSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      router.replace('/' as never);
    } catch (error: unknown) {
      const statusCode = (error as { response?: { status?: number } }).response?.status;
      setErrorMessage(statusCode === 401 ? 'Credenciais inválidas.' : 'Não foi possível acessar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack bg='$background' flex={1} items='center' justify='center' p='$5'>
          <YStack gap='$8' maxW={320} width='100%'>
            <Image
              accessibilityLabel='Logo Focinho Amigo'
              resizeMode='contain'
              source={Logo}
              style={{ height: 255, width: 288 }}
            />

            <YStack gap='$5' width='100%'>
              <YStack gap='$2'>
                <Label color='$primary' fontSize={18} fontWeight='700' htmlFor='email'>
                  Email
                </Label>
                <Input
                  autoCapitalize='none'
                  bg='$white'
                  borderColor='$border'
                  borderWidth={1}
                  color='$text'
                  id='email'
                  onChangeText={setEmail}
                  placeholder='Digite seu email'
                  placeholderTextColor='$placeholder'
                  rounded='$2'
                  size='$5'
                  value={email}
                />
              </YStack>

              <YStack gap='$2'>
                <Label color='$primary' fontSize={18} fontWeight='700' htmlFor='password'>
                  Senha
                </Label>
                <Input
                  bg='$white'
                  borderColor='$border'
                  borderWidth={1}
                  color='$text'
                  id='password'
                  onChangeText={setPassword}
                  placeholder='Digite sua senha'
                  placeholderTextColor='$placeholder'
                  rounded='$2'
                  secureTextEntry
                  size='$5'
                  value={password}
                />
              </YStack>

              {errorMessage ? (
                <Text color='$error' fontSize={14}>
                  {errorMessage}
                </Text>
              ) : null}

              <Button
                bg='$primary'
                color='$white'
                fontSize={18}
                fontWeight='700'
                disabled={isSubmitting}
                mt='$2'
                onPress={handleSignIn}
                pressStyle={{ bg: '$secondary' }}
                rounded='$2'
                size='$6'
              >
                Acessar
              </Button>
            </YStack>

            <Text color='$primary' fontSize={16} style={{ textAlign: 'center' }}>
              Esqueceu a senha?
            </Text>

            <Text color='$textMuted' fontSize={12} style={{ textAlign: 'center' }}>
              Focinho Amigo © 2026. Todos os direitos reservados.
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
