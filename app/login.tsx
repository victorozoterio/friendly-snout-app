import { Redirect, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Button, Input, Label, YStack } from 'tamagui';
import { FormErrorInline } from '../src/components/form-error-inline';
import { PublicAuthLayout, PublicAuthLogo } from '../src/components/public-auth-layout';
import { useAuth } from '../src/contexts/auth-context';
import { routes } from '../src/routes';
import {
  emptySignInFieldErrors,
  getSignInErrorMessage,
  type SignInFieldErrors,
  signInSchema,
} from '../src/services/auth';

const defaultInputBorderStyle = {
  borderColor: '$border',
  borderWidth: 1,
} as const;

const errorInputBorderStyle = {
  borderColor: '$error',
  borderWidth: 2,
  focusStyle: {
    borderColor: '$error',
    borderWidth: 2,
  },
} as const;

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

  const hasApiError = Boolean(apiError);
  const emailHasError = Boolean(fieldErrors.email) || hasApiError;
  const passwordHasError = Boolean(fieldErrors.password) || hasApiError;

  return (
    <PublicAuthLayout>
      <YStack gap='$5' width='100%'>
        <PublicAuthLogo />

        <YStack gap='$1' width='100%'>
          <YStack gap='$1'>
            <Label color='$primary' fontSize={18} fontWeight='700' htmlFor='email'>
              Email
            </Label>

            <Input
              autoCapitalize='none'
              bg='$white'
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
              {...(emailHasError ? errorInputBorderStyle : defaultInputBorderStyle)}
            />

            <FormErrorInline message={fieldErrors.email} />
          </YStack>

          <YStack gap='$1'>
            <Label color='$primary' fontSize={18} fontWeight='700' htmlFor='password'>
              Senha
            </Label>

            <Input
              bg='$white'
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
              {...(passwordHasError ? errorInputBorderStyle : defaultInputBorderStyle)}
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
          onPress={() => router.push(routes.forgotPassword)}
          px='$0'
          style={{ alignSelf: 'center' }}
        >
          Esqueceu a senha?
        </Button>
      </YStack>
    </PublicAuthLayout>
  );
}
