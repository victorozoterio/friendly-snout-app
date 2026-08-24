import { Text, XStack } from 'tamagui';

import type { AnimalStage } from '../services/animals';
import { useAppColors } from './main-layout';

const stageLabels: Record<AnimalStage, string> = {
  quarentena: 'Quarentena',
  acolhido: 'Acolhido',
  adotado: 'Adotado',
  perdido: 'Perdido',
};

export function useAnimalStageColors(): Record<AnimalStage, string> {
  const colors = useAppColors();

  return {
    quarentena: colors.warning,
    acolhido: colors.primary,
    adotado: colors.success,
    perdido: colors.danger,
  };
}

export function AnimalStageBadge({ stage }: { stage: AnimalStage }) {
  const stageColors = useAnimalStageColors();
  const accent = stageColors[stage];

  return (
    <XStack
      items='center'
      px='$2'
      py='$1'
      rounded='$10'
      style={{ backgroundColor: `${accent}22`, borderColor: `${accent}55`, borderWidth: 1 }}
    >
      <Text fontSize={12} fontWeight='700' style={{ color: accent }}>
        {stageLabels[stage]}
      </Text>
    </XStack>
  );
}
