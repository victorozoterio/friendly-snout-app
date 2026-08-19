import { useRouter } from 'expo-router';
import { Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Label, Text, YStack } from 'tamagui';

import Logo from '../assets/logo.png';

export default function Login() {
  const router = useRouter();

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
                  placeholder='Digite seu email'
                  placeholderTextColor='$placeholder'
                  rounded='$2'
                  size='$5'
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
                  placeholder='Digite sua senha'
                  placeholderTextColor='$placeholder'
                  rounded='$2'
                  secureTextEntry
                  size='$5'
                />
              </YStack>

              <Button
                bg='$primary'
                color='$white'
                fontSize={18}
                fontWeight='700'
                mt='$2'
                onPress={() => router.replace('/home')}
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
