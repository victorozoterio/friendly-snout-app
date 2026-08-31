import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, CheckSquareIcon } from 'phosphor-react-native';
import { ActivityIndicator, Pressable } from 'react-native';
import { Text, XStack } from 'tamagui';

import { getPrimaryFormAction } from '../../utils/animal-form';
import { useAppColors } from '../main-layout';
import { animalFormSteps, onPrimaryColor } from './constants';

type AnimalFormActionsProps = {
  currentStep: number;
  isEdit: boolean;
  isSubmitting: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
};

function PrimaryActionIcon({ icon }: { icon: ReturnType<typeof getPrimaryFormAction>['icon'] }) {
  switch (icon) {
    case 'loading':
      return <ActivityIndicator color={onPrimaryColor} />;
    case 'continue':
      return <ArrowRightIcon color={onPrimaryColor} size={20} weight='bold' />;
    case 'save':
      return <CheckSquareIcon color={onPrimaryColor} size={21} weight='bold' />;
    case 'create':
      return <CheckCircleIcon color={onPrimaryColor} size={21} weight='bold' />;
  }
}

export function AnimalFormActions({
  currentStep,
  isEdit,
  isSubmitting,
  onNext,
  onPrevious,
  onSubmit,
}: AnimalFormActionsProps) {
  const colors = useAppColors();
  const isFinalStep = currentStep === animalFormSteps.length - 1;
  const action = getPrimaryFormAction({ isEdit, isFinalStep, isSubmitting });
  const handlePrimaryAction = isFinalStep ? onSubmit : onNext;

  return (
    <XStack gap='$3'>
      {currentStep > 0 ? (
        <Pressable
          accessibilityLabel='Voltar para a etapa anterior'
          disabled={isSubmitting}
          onPress={onPrevious}
          style={({ pressed }) => ({
            alignItems: 'center',
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: 14,
            borderWidth: 1,
            flex: 1,
            justifyContent: 'center',
            opacity: isSubmitting ? 0.55 : pressed ? 0.72 : 1,
            paddingHorizontal: 14,
            paddingVertical: 15,
          })}
        >
          <XStack gap='$2' items='center'>
            <ArrowLeftIcon color={colors.text} size={20} weight='bold' />
            <Text fontSize={15} fontWeight='700' style={{ color: colors.text }}>
              Voltar
            </Text>
          </XStack>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityLabel={action.accessibilityLabel}
        disabled={isSubmitting}
        onPress={handlePrimaryAction}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: colors.primary,
          borderRadius: 14,
          flex: currentStep > 0 ? 1.45 : 1,
          justifyContent: 'center',
          opacity: isSubmitting ? 0.55 : pressed ? 0.78 : 1,
          paddingHorizontal: 14,
          paddingVertical: 15,
        })}
      >
        <XStack gap='$2' items='center' justify='center'>
          <PrimaryActionIcon icon={action.icon} />
          <Text fontSize={15} fontWeight='800' style={{ color: onPrimaryColor }}>
            {action.label}
          </Text>
        </XStack>
      </Pressable>
    </XStack>
  );
}
