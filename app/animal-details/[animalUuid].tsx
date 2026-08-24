import { Redirect, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ArrowClockwise, PawPrint, WarningCircle } from 'phosphor-react-native';
import { useCallback, useRef, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';

import { AnimalStageBadge } from '../../src/components/animal-stage-badge';
import { useAppColors } from '../../src/components/main-layout';
import { ScreenHeader } from '../../src/components/screen-header';
import { useAuth } from '../../src/contexts/auth-context';
import { type Animal, getAnimal } from '../../src/services/animals';

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value: string) {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function formatAge(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 1) return 'menos de 1 mês';

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const yearsLabel = years > 0 ? `${years} ${years === 1 ? 'ano' : 'anos'}` : '';
  const monthsLabel = remainingMonths > 0 ? `${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}` : '';

  if (yearsLabel && monthsLabel) return `${yearsLabel} e ${monthsLabel}`;
  return yearsLabel || monthsLabel;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useAppColors();

  return (
    <XStack gap='$3' items='center' justify='space-between' py='$2'>
      <Text fontSize={14} style={{ color: colors.muted }}>
        {label}
      </Text>
      <Text
        flex={1}
        fontSize={14}
        fontWeight='600'
        numberOfLines={2}
        style={{ color: colors.text, textAlign: 'right' }}
      >
        {value}
      </Text>
    </XStack>
  );
}

function InfoCard({ rows, title }: { rows: { label: string; value: string }[]; title: string }) {
  const colors = useAppColors();

  return (
    <YStack gap='$2'>
      <Text fontSize={18} fontWeight='800' style={{ color: colors.text }}>
        {title}
      </Text>
      <Card
        borderWidth={1}
        px='$3'
        py='$2'
        rounded='$4'
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        {rows.map((row, index) => (
          <YStack key={row.label} style={index > 0 ? { borderTopColor: colors.border, borderTopWidth: 1 } : undefined}>
            <InfoRow label={row.label} value={row.value} />
          </YStack>
        ))}
      </Card>
    </YStack>
  );
}

function AnimalDetailsSkeleton() {
  const colors = useAppColors();

  return (
    <YStack gap='$4' p='$5'>
      <Card
        borderWidth={1}
        height={220}
        rounded='$4'
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      />
      <XStack height={28} rounded='$3' style={{ backgroundColor: colors.cardMuted }} width={180} />
      <Card
        borderWidth={1}
        height={260}
        rounded='$4'
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      />
      <Text style={{ color: colors.muted, textAlign: 'center' }}>Carregando dados do animal...</Text>
    </YStack>
  );
}

function AnimalDetailsError({ onRetry }: { onRetry: () => void }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6' style={{ minHeight: 320 }}>
      <WarningCircle color={colors.warning} size={40} weight='fill' />
      <Text fontSize={17} fontWeight='700' style={{ color: colors.text, textAlign: 'center' }}>
        Não foi possível carregar os dados do animal.
      </Text>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>Verifique sua conexão e tente novamente.</Text>
      <Pressable
        accessibilityLabel='Tentar carregar os dados novamente'
        onPress={onRetry}
        style={({ pressed }) => ({
          backgroundColor: colors.primary,
          borderRadius: 12,
          marginTop: 4,
          opacity: pressed ? 0.75 : 1,
          paddingHorizontal: 16,
          paddingVertical: 12,
        })}
      >
        <XStack gap='$2' items='center'>
          <ArrowClockwise color='#FFFFFF' size={18} />
          <Text fontWeight='700' style={{ color: '#FFFFFF' }}>
            Tentar novamente
          </Text>
        </XStack>
      </Pressable>
    </YStack>
  );
}

function AnimalDetailsContent({ animal }: { animal: Animal }) {
  const colors = useAppColors();
  const notInformed = 'Não informado';

  const generalRows = [
    { label: 'Espécie', value: animal.species.name },
    { label: 'Raça', value: animal.breed.name },
    { label: 'Sexo', value: capitalize(animal.sex) },
    { label: 'Porte', value: capitalize(animal.size) },
    { label: 'Cor', value: animal.color },
    {
      label: 'Nascimento',
      value: animal.birthDate ? `${formatDate(animal.birthDate)} (${formatAge(animal.birthDate)})` : notInformed,
    },
  ];

  const healthRows = [
    { label: 'Castrado', value: animal.castrated ? 'Sim' : 'Não' },
    { label: 'FIV', value: capitalize(animal.fiv) },
    { label: 'FELV', value: capitalize(animal.felv) },
  ];

  const identificationRows = [
    { label: 'Microchip', value: animal.microchip ?? notInformed },
    { label: 'RGA', value: animal.rga ?? notInformed },
  ];

  return (
    <YStack gap='$5' p='$5' pt='$2'>
      {animal.photoUrl ? (
        <Image
          accessibilityLabel={`Foto de ${animal.name}`}
          resizeMode='cover'
          source={{ uri: animal.photoUrl }}
          style={{ borderRadius: 16, height: 220, width: '100%' }}
        />
      ) : (
        <YStack
          height={220}
          items='center'
          justify='center'
          rounded='$4'
          style={{ backgroundColor: colors.cardMuted, borderColor: colors.border, borderWidth: 1 }}
        >
          <PawPrint color={colors.primary} size={64} weight='fill' />
        </YStack>
      )}

      <YStack gap='$2'>
        <XStack gap='$3' items='center' justify='space-between'>
          <Text flex={1} fontSize={26} fontWeight='800' numberOfLines={2} style={{ color: colors.text }}>
            {animal.name}
          </Text>
          <AnimalStageBadge stage={animal.status} />
        </XStack>
        <Text fontSize={14} style={{ color: colors.muted }}>
          {animal.species.name} • {animal.breed.name}
        </Text>
      </YStack>

      <InfoCard rows={generalRows} title='Informações gerais' />
      <InfoCard rows={healthRows} title='Saúde' />
      <InfoCard rows={identificationRows} title='Identificação' />

      {animal.notes ? (
        <YStack gap='$2'>
          <Text fontSize={18} fontWeight='800' style={{ color: colors.text }}>
            Observações
          </Text>
          <Card
            borderWidth={1}
            p='$3'
            rounded='$4'
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Text fontSize={14} lineHeight={20} style={{ color: colors.text }}>
              {animal.notes}
            </Text>
          </Card>
        </YStack>
      ) : null}

      <Text fontSize={12} style={{ color: colors.muted, textAlign: 'center' }}>
        Cadastrado em {formatDate(animal.createdAt)}
      </Text>
    </YStack>
  );
}

function AnimalDetails() {
  const { animalUuid } = useLocalSearchParams<{ animalUuid: string }>();
  const colors = useAppColors();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hasLoadedAnimal = useRef(false);

  const loadAnimal = useCallback(
    async (isManualRefresh = false) => {
      if (!animalUuid) return;

      if (isManualRefresh || hasLoadedAnimal.current) setIsRefreshing(true);
      else setIsLoading(true);

      setHasError(false);

      try {
        const data = await getAnimal(animalUuid);
        setAnimal(data);
        hasLoadedAnimal.current = true;
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [animalUuid],
  );

  useFocusEffect(
    useCallback(() => {
      void loadAnimal();
    }, [loadAnimal]),
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScreenHeader description='Detalhes do animal' title={animal?.name ?? 'Animal'} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            colors={[colors.primary]}
            onRefresh={() => void loadAnimal(true)}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading && !animal ? <AnimalDetailsSkeleton /> : null}
        {hasError && !animal ? <AnimalDetailsError onRetry={() => void loadAnimal()} /> : null}
        {animal ? (
          <YStack>
            {hasError ? (
              <Text fontSize={13} px='$5' style={{ color: colors.muted, textAlign: 'center' }}>
                Não foi possível atualizar agora. Os últimos dados carregados continuam visíveis.
              </Text>
            ) : null}
            <AnimalDetailsContent animal={animal} />
          </YStack>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function AnimalDetailsScreen() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href='/login' />;

  return <AnimalDetails />;
}
