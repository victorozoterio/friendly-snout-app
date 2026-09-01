import { ArrowClockwiseIcon, WarningCircleIcon } from 'phosphor-react-native';
import { ActivityIndicator, Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

import { palette } from '../../theme';
import { useAppColors } from '../main-layout';

export function LoadingState({ label }: { label: string }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6'>
      <ActivityIndicator color={colors.primary} size='large' />
      <Text style={{ color: colors.muted }}>{label}</Text>
    </YStack>
  );
}

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6'>
      <WarningCircleIcon color={colors.warning} size={42} weight='fill' />
      <Text fontSize={17} fontWeight='700' style={{ color: colors.text, textAlign: 'center' }}>
        {message}
      </Text>
      <Pressable
        accessibilityLabel='Tentar carregar o formulário novamente'
        onPress={onRetry}
        style={({ pressed }) => ({
          backgroundColor: colors.primary,
          borderRadius: 12,
          opacity: pressed ? 0.75 : 1,
          paddingHorizontal: 16,
          paddingVertical: 12,
        })}
      >
        <XStack gap='$2' items='center'>
          <ArrowClockwiseIcon color={palette.neutral0} size={18} />
          <Text fontWeight='700' style={{ color: palette.neutral0 }}>
            Tentar novamente
          </Text>
        </XStack>
      </Pressable>
    </YStack>
  );
}
