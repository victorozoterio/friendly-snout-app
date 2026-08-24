import { useRouter } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

import { useAppColors } from './main-layout';

type ScreenHeaderProps = {
  title: string;
  description?: string;
};

export function ScreenHeader({ description, title }: ScreenHeaderProps) {
  const router = useRouter();
  const colors = useAppColors();

  return (
    <XStack gap='$3' items='center' px='$5' py='$4'>
      <Pressable
        accessibilityLabel='Voltar'
        onPress={() => router.back()}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: 14,
          borderWidth: 1,
          height: 44,
          justifyContent: 'center',
          opacity: pressed ? 0.72 : 1,
          width: 44,
        })}
      >
        <CaretLeft color={colors.text} size={22} weight='bold' />
      </Pressable>
      <YStack flex={1} gap='$1'>
        <Text fontSize={22} fontWeight='800' numberOfLines={1} style={{ color: colors.text, letterSpacing: -0.5 }}>
          {title}
        </Text>
        {description ? (
          <Text fontSize={13} numberOfLines={1} style={{ color: colors.muted }}>
            {description}
          </Text>
        ) : null}
      </YStack>
    </XStack>
  );
}
