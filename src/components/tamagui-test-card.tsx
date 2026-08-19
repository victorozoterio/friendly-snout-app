import { Button, H2, XStack, YStack } from 'tamagui';

export function TamaguiTestCard() {
  return (
    <YStack bg='$background' gap='$4' p='$5' shadowColor='$shadowColor' shadowOpacity={0.12} shadowRadius={14}>
      <YStack gap='$2'>
        <H2 color='$color' size='$7'>
          Tamagui
        </H2>
      </YStack>

      <XStack gap='$3'>
        <Button theme='green' size='$4'>
          Validar
        </Button>
      </XStack>
    </YStack>
  );
}
