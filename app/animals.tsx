import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { ArrowClockwiseIcon, PawPrintIcon, WarningCircleIcon } from 'phosphor-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, ScrollView } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';

import { AnimalStageBadge, useAnimalStageColors } from '../src/components/animal-stage-badge';
import {
  ListFloatingAction,
  ListItemCard,
  ListItemChevron,
  ListScreenControls,
  ListSearchField,
  listContentContainerStyle,
} from '../src/components/list-screen-elements';
import { MainLayout, useAppColors } from '../src/components/main-layout';
import { useAuth } from '../src/contexts/auth-context';
import { animalRoutes, routes } from '../src/routes';
import { type Animal, type AnimalStage, getAnimals, type PaginatedAnimalsMeta } from '../src/services/animals';
import { palette } from '../src/theme';

type StageFilter = AnimalStage | 'all';

const stageFilterOptions: { label: string; value: StageFilter }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Quarentena', value: 'quarentena' },
  { label: 'Acolhidos', value: 'acolhido' },
  { label: 'Adotados', value: 'adotado' },
  { label: 'Perdidos', value: 'perdido' },
];

function AnimalCard({ animal, onPress }: { animal: Animal; onPress: () => void }) {
  const colors = useAppColors();

  return (
    <ListItemCard accessibilityLabel={`Ver detalhes de ${animal.name}`} onPress={onPress}>
      <XStack gap='$3' items='center'>
        {animal.photoUrl ? (
          <Image
            accessibilityLabel={`Foto de ${animal.name}`}
            source={{ uri: animal.photoUrl }}
            style={{ borderRadius: 14, height: 60, width: 60 }}
          />
        ) : (
          <XStack
            height={60}
            items='center'
            justify='center'
            rounded='$4'
            style={{ backgroundColor: colors.cardMuted }}
            width={60}
          >
            <PawPrintIcon color={colors.primary} size={28} weight='fill' />
          </XStack>
        )}
        <YStack flex={1} gap='$1'>
          <XStack gap='$2' items='center' justify='space-between'>
            <Text flex={1} fontSize={17} fontWeight='800' numberOfLines={1} style={{ color: colors.text }}>
              {animal.name}
            </Text>
            <ListItemChevron />
          </XStack>
          <Text fontSize={13} numberOfLines={1} style={{ color: colors.muted }}>
            {animal.species.name} • {animal.breed.name}
          </Text>
          <XStack gap='$2' items='center' mt='$1'>
            <AnimalStageBadge stage={animal.status} />
            <Text fontSize={12} numberOfLines={1} style={{ color: colors.muted }}>
              {animal.sex} · porte {animal.size}
            </Text>
          </XStack>
        </YStack>
      </XStack>
    </ListItemCard>
  );
}

function AnimalsSkeleton() {
  const colors = useAppColors();

  return (
    <YStack gap='$3' pt='$2'>
      {[0, 1, 2, 3].map((item) => (
        <Card
          borderWidth={1}
          height={92}
          key={item}
          rounded='$4'
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        />
      ))}
      <Text style={{ color: colors.muted, textAlign: 'center' }}>Carregando animais...</Text>
    </YStack>
  );
}

function AnimalsError({ onRetry }: { onRetry: () => void }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6' style={{ minHeight: 260 }}>
      <WarningCircleIcon color={colors.warning} size={40} weight='fill' />
      <Text fontSize={17} fontWeight='700' style={{ color: colors.text, textAlign: 'center' }}>
        Não foi possível carregar os animais.
      </Text>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>Verifique sua conexão e tente novamente.</Text>
      <Pressable
        accessibilityLabel='Tentar carregar os animais novamente'
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
          <ArrowClockwiseIcon color={palette.neutral0} size={18} />
          <Text fontWeight='700' style={{ color: palette.neutral0 }}>
            Tentar novamente
          </Text>
        </XStack>
      </Pressable>
    </YStack>
  );
}

function AnimalsEmpty({ hasActiveFilters }: { hasActiveFilters: boolean }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6' style={{ minHeight: 260 }}>
      <PawPrintIcon color={colors.muted} size={44} weight='fill' />
      <Text fontSize={17} fontWeight='700' style={{ color: colors.text, textAlign: 'center' }}>
        {hasActiveFilters ? 'Nenhum animal encontrado' : 'Nenhum animal cadastrado'}
      </Text>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>
        {hasActiveFilters
          ? 'Ajuste a busca ou os filtros e tente novamente.'
          : 'Toque em Novo animal para cadastrar o primeiro.'}
      </Text>
    </YStack>
  );
}

function AnimalsList() {
  const router = useRouter();
  const colors = useAppColors();
  const stageColors = useAnimalStageColors();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [meta, setMeta] = useState<PaginatedAnimalsMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hasLoadedAnimals = useRef(false);
  const requestIdRef = useRef(0);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAnimals = useCallback(async (search: string, isManualRefresh = false) => {
    const requestId = ++requestIdRef.current;

    if (isManualRefresh || hasLoadedAnimals.current) setIsRefreshing(true);
    else setIsLoading(true);

    setHasError(false);

    try {
      const { data, meta: pageMeta } = await getAnimals({ search: search || undefined });
      if (requestId !== requestIdRef.current) return;

      setAnimals(data);
      setMeta(pageMeta);
      hasLoadedAnimals.current = true;
    } catch {
      if (requestId === requestIdRef.current) setHasError(true);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  const loadMoreAnimals = useCallback(async () => {
    if (isLoading || isRefreshing || isLoadingMore) return;
    if (!meta || meta.currentPage >= meta.totalPages) return;

    setIsLoadingMore(true);

    try {
      const { data, meta: pageMeta } = await getAnimals({
        page: meta.currentPage + 1,
        search: activeSearch || undefined,
      });

      setAnimals((current) => {
        const knownUuids = new Set(current.map((animal) => animal.uuid));
        return [...current, ...data.filter((animal) => !knownUuids.has(animal.uuid))];
      });
      setMeta(pageMeta);
    } catch {
      setHasError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeSearch, isLoading, isLoadingMore, isRefreshing, meta]);

  useFocusEffect(
    useCallback(() => {
      void loadAnimals(activeSearch);
    }, [activeSearch, loadAnimals]),
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setActiveSearch(value.trim()), 400);
  };

  const clearSearch = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setSearchTerm('');
    setActiveSearch('');
  };

  const visibleAnimals = useMemo(
    () => (stageFilter === 'all' ? animals : animals.filter((animal) => animal.status === stageFilter)),
    [animals, stageFilter],
  );

  const hasActiveFilters = activeSearch.length > 0 || stageFilter !== 'all';
  const showErrorState = hasError && animals.length === 0;
  const showEmptyState = !isLoading && !showErrorState && visibleAnimals.length === 0;
  const totalCount = stageFilter === 'all' && meta ? meta.totalItems : visibleAnimals.length;

  return (
    <MainLayout description='Gerencie os animais cadastrados' title='Animais'>
      <YStack flex={1}>
        <ListScreenControls>
          <ListSearchField
            accessibilityLabel='Buscar animal pelo nome'
            onChangeText={handleSearchChange}
            onClear={clearSearch}
            placeholder='Buscar pelo nome...'
            value={searchTerm}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap='$2'>
              {stageFilterOptions.map(({ label, value }) => {
                const isActive = stageFilter === value;
                const accent = value === 'all' ? colors.primary : stageColors[value];

                return (
                  <Pressable
                    accessibilityLabel={`Filtrar por ${label}`}
                    accessibilityState={{ selected: isActive }}
                    key={value}
                    onPress={() => setStageFilter(value)}
                    style={({ pressed }) => ({
                      backgroundColor: isActive ? `${accent}22` : colors.card,
                      borderColor: isActive ? accent : colors.border,
                      borderRadius: 20,
                      borderWidth: 1,
                      opacity: pressed ? 0.72 : 1,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                    })}
                  >
                    <Text
                      fontSize={13}
                      fontWeight={isActive ? '700' : '500'}
                      style={{ color: isActive ? accent : colors.muted }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </XStack>
          </ScrollView>

          {!isLoading && !showErrorState && visibleAnimals.length > 0 ? (
            <Text fontSize={13} style={{ color: colors.muted }}>
              {totalCount} {totalCount === 1 ? 'animal encontrado' : 'animais encontrados'}
            </Text>
          ) : null}

          {hasError && animals.length > 0 ? (
            <Text fontSize={13} style={{ color: colors.muted }}>
              Não foi possível atualizar agora. Os últimos dados carregados continuam visíveis.
            </Text>
          ) : null}
        </ListScreenControls>

        {isLoading ? (
          <YStack flex={1} px='$5'>
            <AnimalsSkeleton />
          </YStack>
        ) : showErrorState ? (
          <AnimalsError onRetry={() => void loadAnimals(activeSearch)} />
        ) : (
          <FlatList
            contentContainerStyle={listContentContainerStyle}
            data={visibleAnimals}
            keyboardShouldPersistTaps='handled'
            keyExtractor={(animal) => animal.uuid}
            ListEmptyComponent={showEmptyState ? <AnimalsEmpty hasActiveFilters={hasActiveFilters} /> : null}
            ListFooterComponent={
              isLoadingMore ? (
                <YStack items='center' py='$3'>
                  <ActivityIndicator color={colors.primary} />
                </YStack>
              ) : null
            }
            onEndReached={() => void loadMoreAnimals()}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                colors={[colors.primary]}
                onRefresh={() => void loadAnimals(activeSearch, true)}
                refreshing={isRefreshing}
                tintColor={colors.primary}
              />
            }
            renderItem={({ item }) => (
              <AnimalCard animal={item} onPress={() => router.push(animalRoutes.details(item.uuid))} />
            )}
          />
        )}

        <ListFloatingAction
          accessibilityLabel='Cadastrar novo animal'
          onPress={() => router.push(routes.animalForm)}
          label='Novo animal'
        />
      </YStack>
    </MainLayout>
  );
}

export default function Animals() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href={routes.login} />;

  return <AnimalsList />;
}
