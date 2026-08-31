import { Redirect, useLocalSearchParams } from 'expo-router';
import { PillIcon, PlusIcon } from 'phosphor-react-native';

import { Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';

import { useAppColors } from '../../src/components/main-layout';
import { ScreenHeader } from '../../src/components/screen-header';
import { useAuth } from '../../src/contexts/auth-context';
import { routes } from '../../src/routes';
import { palette } from '../../src/theme';

export default function AnimalMedicinesScreen() {
  const { animalUuid } = useLocalSearchParams<{ animalUuid: string }>();
  const { status } = useAuth();
  const colors = useAppColors();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href={routes.login} />;

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScreenHeader description='Aplicações de medicamentos do animal' title='Agenda de Medicamentos' />
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <YStack flex={1} gap='$4' items='center' justify='center' py='$6'>
          <XStack
            height={80}
            items='center'
            justify='center'
            rounded='$10'
            style={{ backgroundColor: `${colors.primary}1A` }}
            width={80}
          >
            <PillIcon color={colors.primary} size={40} weight='fill' />
          </XStack>
          <YStack gap='$2' items='center'>
            <Text fontSize={20} fontWeight='800' style={{ color: colors.text, textAlign: 'center' }}>
              Histórico e Aplicações
            </Text>
            <Text fontSize={14} style={{ color: colors.muted, textAlign: 'center' }}>
              Aplicações de medicamentos para o animal (UUID: {animalUuid?.slice(0, 8)}...)
            </Text>
          </YStack>

          <Pressable
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: colors.primary,
              borderRadius: 14,
              opacity: pressed ? 0.76 : 1,
              paddingHorizontal: 20,
              paddingVertical: 14,
            })}
          >
            <XStack gap='$2' items='center'>
              <PlusIcon color={palette.neutral0} size={20} weight='bold' />
              <Text fontWeight='700' style={{ color: palette.neutral0 }}>
                Agendar Medicamento
              </Text>
            </XStack>
          </Pressable>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
