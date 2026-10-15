import { Redirect, useRouter } from 'expo-router';

import { useRef, useState } from 'react';

import { Alert, Image, ScrollView } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input, Label, Text, YStack } from 'tamagui';

import { FormErrorInline } from '../src/components/form-error-inline';

import { useAuth } from '../src/contexts/auth-context';

import { routes } from '../src/routes';

import {
  emptySignInFieldErrors,
  getSignInErrorMessage,
  type SignInFieldErrors,
  signInSchema,
} from '../src/services/auth';

const Logo = require('../assets/logo.png') as number;

export default function Login() {
  const router = useRouter();

  const { signIn, status } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>(emptySignInFieldErrors);

  const [apiError, setApiError] = useState<string | null>(null);

  if (status === 'loading') return null;
  if (status === 'authenticated') return <Redirect href={routes.home} />;

  const setSubmitting = (value: boolean) => {
    isSubmittingRef.current = value;
    setIsSubmitting(value);
  };

  const submitCredentials = async () => {
    const result = signInSchema.safeParse({
      email,
      password,
    });

    setApiError(null);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      setFieldErrors({
        email: errors.email?.[0] ?? null,
        password: errors.password?.[0] ?? null,
      });

      return;
    }

    setFieldErrors(emptySignInFieldErrors);

    setSubmitting(true);

    try {
      await signIn(result.data.email, result.data.password);

      router.replace(routes.home);
    } catch (error: unknown) {
      setApiError(getSignInErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignIn = () => {
    if (isSubmittingRef.current) return;
    void submitCredentials();
  };

  const handleForgotPassword = () => {
    Alert.alert('Recuperação de senha', 'A recuperação de senha ainda não está disponível.');
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
              style={{
                height: 255,
                width: 288,
              }}
            />

            <YStack gap='$2' width='100%'>
              <YStack gap='$1'>
                <Label color='$primary' fontSize={18} fontWeight='700' htmlFor='email'>
                  Email
                </Label>

                <Input
                  autoCapitalize='none'
                  bg='$white'
                  borderColor={fieldErrors.email || apiError ? '$error' : '$border'}
                  borderWidth={1}
                  color='$text'
                  id='email'
                  onChangeText={(value) => {
                    setEmail(value);

                    setFieldErrors((current) => ({
                      ...current,
                      email: null,
                    }));

                    setApiError(null);
                  }}
                  placeholder='Digite seu email'
                  placeholderTextColor='$placeholder'
                  rounded='$2'
                  size='$5'
                  value={email}
                />

                <FormErrorInline message={fieldErrors.email} />
              </YStack>

              <YStack gap='$1'>
                <Label color='$primary' fontSize={18} fontWeight='700' htmlFor='password'>
                  Senha
                </Label>

                <Input
                  bg='$white'
                  borderColor={fieldErrors.password || apiError ? '$error' : '$border'}
                  borderWidth={1}
                  color='$text'
                  id='password'
                  onChangeText={(value) => {
                    setPassword(value);

                    setFieldErrors((current) => ({
                      ...current,
                      password: null,
                    }));

                    setApiError(null);
                  }}
                  placeholder='Digite sua senha'
                  placeholderTextColor='$placeholder'
                  rounded='$2'
                  secureTextEntry
                  size='$5'
                  value={password}
                />

                <FormErrorInline message={fieldErrors.password || apiError} />
              </YStack>

              <Button
                bg='$primary'
                color='$white'
                fontSize={18}
                fontWeight='700'
                mt='$2'
                onPress={handleSignIn}
                pressStyle={{
                  bg: '$secondary',
                }}
                rounded='$2'
                size='$6'
              >
                {isSubmitting ? 'Entrando...' : 'Acessar'}
              </Button>
            </YStack>

            <Button
              chromeless
              color='$primary'
              fontSize={16}
              onPress={handleForgotPassword}
              px='$0'
              style={{ alignSelf: 'center' }}
            >
              Esqueceu a senha?
            </Button>

            <Text
              color='$textMuted'
              fontSize={12}
              style={{
                textAlign: 'center',
              }}
            >
              Focinho Amigo © 2026. Todos os direitos reservados.
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
