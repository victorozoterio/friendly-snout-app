import { Text, XStack, YStack } from 'tamagui';

import { useAppColors } from '../main-layout';
import { animalFormSteps } from './constants';

export { ChoiceField, FieldLabel, FormSection, InputField } from '../form/fields';

export function ProgressIndicator({ currentStep }: { currentStep: number }) {
  const appColors = useAppColors();

  return (
    <YStack gap='$2'>
      <XStack gap='$2'>
        {animalFormSteps.map((step, index) => (
          <YStack flex={1} gap='$2' key={step.title}>
            <YStack
              height={6}
              rounded='$2'
              style={{ backgroundColor: index <= currentStep ? appColors.primary : appColors.border }}
            />
            <Text
              fontSize={11}
              fontWeight={index === currentStep ? '700' : '500'}
              numberOfLines={1}
              style={{ color: index === currentStep ? appColors.primary : appColors.muted, textAlign: 'center' }}
            >
              {step.shortTitle}
            </Text>
          </YStack>
        ))}
      </XStack>
      <Text fontSize={12} style={{ color: appColors.muted, textAlign: 'right' }}>
        Etapa {currentStep + 1} de {animalFormSteps.length}
      </Text>
    </YStack>
  );
}
