import type { ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, YStack } from 'tamagui';

const logo = require('../../assets/logo.png') as number;

type PublicAuthLayoutProps = {
  children: ReactNode;
};

/**
 * Organiza as telas públicas de autenticação, respeitando áreas seguras e
 * permitindo rolagem somente quando o teclado ou uma tela baixa exigirem.
 */
export function PublicAuthLayout({ children }: PublicAuthLayoutProps) {
  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.select({ android: 'height', default: 'padding' })} style={{ flex: 1 }}>
        <ScrollView
          bounces={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          <YStack bg='$background' flex={1} px='$5' py='$4'>
            <YStack flex={1} gap='$4' maxW={320} self='center' width='100%'>
              <YStack flex={1} justify='center'>
                {children}
              </YStack>

              <Text color='$textMuted' fontSize={12} style={{ textAlign: 'center' }}>
                Focinho Amigo © {new Date().getFullYear()}. Todos os direitos reservados.
              </Text>
            </YStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Exibe a marca nas telas públicas com dimensões consistentes. */
export function PublicAuthLogo() {
  return (
    <Image
      accessibilityLabel='Logo Focinho Amigo'
      resizeMode='contain'
      source={logo}
      style={{ alignSelf: 'center', height: 180, maxWidth: 260, width: '100%' }}
    />
  );
}
