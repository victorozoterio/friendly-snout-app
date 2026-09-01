import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import {
  ArrowClockwiseIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
  PillIcon,
  PlusIcon,
  TagIcon,
  WarningCircleIcon,
  XCircleIcon,
} from 'phosphor-react-native';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, TextInput } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';

import { MainLayout, useAppColors } from '../src/components/main-layout';
import { useAuth } from '../src/contexts/auth-context';
import { medicineRoutes, routes } from '../src/routes';
import { getMedicines, type Medicine, type PaginatedMeta } from '../src/services/medicines';
import { palette } from '../src/theme';
import { safeCapitalize } from '../src/utils/date';

function MedicineStatusBadge({ isActive }: { isActive: boolean }) {
  const colors = useAppColors();
  const accent = isActive ? colors.success : colors.muted;

  return (
    <XStack
      items='center'
      px='$2'
      py='$1'
      rounded='$10'
      style={{ backgroundColor: `${accent}22`, borderColor: `${accent}55`, borderWidth: 1 }}
    >
      <Text fontSize={12} fontWeight='700' style={{ color: accent }}>
        {isActive ? 'Ativo' : 'Inativo'}
      </Text>
    </XStack>
  );
}

function MedicineCard({ medicine, onPress }: { medicine: Medicine; onPress: () => void }) {
  const colors = useAppColors();
  const quantityLabel = medicine.quantity === 1 ? '1 unidade' : `${medicine.quantity} unidades`;

  return (
    <Pressable
      accessibilityLabel={`Editar ${medicine.name}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.76 : 1 })}
    >
      <Card borderWidth={1} p='$3' rounded='$4' style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <XStack gap='$3' items='center'>
          <XStack
            height={60}
            items='center'
            justify='center'
            rounded='$4'
            style={{ backgroundColor: colors.cardMuted }}
            width={60}
          >
            <PillIcon color={colors.primary} size={28} weight='fill' />
          </XStack>
          <YStack flex={1} gap='$1'>
            <XStack gap='$2' items='center' justify='space-between'>
              <Text flex={1} fontSize={17} fontWeight='800' numberOfLines={1} style={{ color: colors.text }}>
                {safeCapitalize(medicine.name)}
              </Text>
              <CaretRightIcon color={colors.muted} size={18} weight='bold' />
            </XStack>
            {medicine.description ? (
              <Text fontSize={13} numberOfLines={1} style={{ color: colors.muted }}>
                {medicine.description}
              </Text>
            ) : null}
            <XStack gap='$2' items='center' mt='$1'>
              <MedicineStatusBadge isActive={medicine.isActive} />
              <Text fontSize={12} numberOfLines={1} style={{ color: colors.muted }}>
                {quantityLabel} em estoque
              </Text>
            </XStack>
          </YStack>
        </XStack>
      </Card>
    </Pressable>
  );
}

function MedicinesSkeleton() {
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
      <Text style={{ color: colors.muted, textAlign: 'center' }}>Carregando medicamentos...</Text>
    </YStack>
  );
}

function MedicinesError({ onRetry }: { onRetry: () => void }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6' style={{ minHeight: 260 }}>
      <WarningCircleIcon color={colors.warning} size={40} weight='fill' />
      <Text fontSize={17} fontWeight='700' style={{ color: colors.text, textAlign: 'center' }}>
        Não foi possível carregar os medicamentos.
      </Text>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>Verifique sua conexão e tente novamente.</Text>
      <Pressable
        accessibilityLabel='Tentar carregar os medicamentos novamente'
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

function MedicinesEmpty({ hasActiveSearch }: { hasActiveSearch: boolean }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6' style={{ minHeight: 260 }}>
      <PillIcon color={colors.muted} size={44} weight='fill' />
      <Text fontSize={17} fontWeight='700' style={{ color: colors.text, textAlign: 'center' }}>
        {hasActiveSearch ? 'Nenhum medicamento encontrado' : 'Nenhum medicamento cadastrado'}
      </Text>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>
        {hasActiveSearch ? 'Ajuste a busca e tente novamente.' : 'Toque em Novo medicamento para cadastrar o primeiro.'}
      </Text>
    </YStack>
  );
}

function MedicinesList() {
  const router = useRouter();
  const colors = useAppColors();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hasLoadedMedicines = useRef(false);
  const requestIdRef = useRef(0);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadMedicines = useCallback(async (search: string, isManualRefresh = false) => {
    const requestId = ++requestIdRef.current;

    if (isManualRefresh || hasLoadedMedicines.current) setIsRefreshing(true);
    else setIsLoading(true);

    setHasError(false);

    try {
      const { data, meta: pageMeta } = await getMedicines({ search: search || undefined });
      if (requestId !== requestIdRef.current) return;

      setMedicines(data);
      setMeta(pageMeta);
      hasLoadedMedicines.current = true;
    } catch {
      if (requestId === requestIdRef.current) setHasError(true);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  const loadMoreMedicines = useCallback(async () => {
    if (isLoading || isRefreshing || isLoadingMore) return;
    if (!meta || meta.currentPage >= meta.totalPages) return;

    setIsLoadingMore(true);

    try {
      const { data, meta: pageMeta } = await getMedicines({
        page: meta.currentPage + 1,
        search: activeSearch || undefined,
      });

      setMedicines((current) => {
        const knownUuids = new Set(current.map((medicine) => medicine.uuid));
        return [...current, ...data.filter((medicine) => !knownUuids.has(medicine.uuid))];
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
      void loadMedicines(activeSearch);
    }, [activeSearch, loadMedicines]),
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

  const hasActiveSearch = activeSearch.length > 0;
  const showErrorState = hasError && medicines.length === 0;
  const showEmptyState = !isLoading && !showErrorState && medicines.length === 0;
  const totalCount = meta?.totalItems ?? medicines.length;

  return (
    <MainLayout description='Gerencie o estoque de medicamentos' title='Medicamentos'>
      <YStack flex={1}>
        <YStack gap='$3' pb='$3' px='$5'>
          <XStack
            gap='$2'
            items='center'
            px='$3'
            rounded='$4'
            style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
          >
            <MagnifyingGlassIcon color={colors.muted} size={20} />
            <TextInput
              accessibilityLabel='Buscar medicamento pelo nome'
              onChangeText={handleSearchChange}
              placeholder='Buscar pelo nome...'
              placeholderTextColor={colors.muted}
              style={{ color: colors.text, flex: 1, fontSize: 15, paddingVertical: 12 }}
              value={searchTerm}
            />
            {searchTerm.length > 0 ? (
              <Pressable accessibilityLabel='Limpar busca' onPress={clearSearch}>
                <XCircleIcon color={colors.muted} size={20} weight='fill' />
              </Pressable>
            ) : null}
          </XStack>

          <XStack items='center' justify='space-between'>
            <Pressable
              accessibilityLabel='Gerenciar marcas de medicamentos'
              onPress={() => router.push(routes.medicineBrands)}
              style={({ pressed }) => ({
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: 20,
                borderWidth: 1,
                opacity: pressed ? 0.72 : 1,
                paddingHorizontal: 14,
                paddingVertical: 8,
              })}
            >
              <XStack gap='$2' items='center'>
                <TagIcon color={colors.primary} size={17} weight='fill' />
                <Text fontSize={13} fontWeight='700' style={{ color: colors.primary }}>
                  Gerenciar marcas
                </Text>
              </XStack>
            </Pressable>

            {!isLoading && !showErrorState && medicines.length > 0 ? (
              <Text fontSize={13} style={{ color: colors.muted }}>
                {totalCount} {totalCount === 1 ? 'medicamento' : 'medicamentos'}
              </Text>
            ) : null}
          </XStack>

          {hasError && medicines.length > 0 ? (
            <Text fontSize={13} style={{ color: colors.muted }}>
              Não foi possível atualizar agora. Os últimos dados carregados continuam visíveis.
            </Text>
          ) : null}
        </YStack>

        {isLoading ? (
          <YStack flex={1} px='$5'>
            <MedicinesSkeleton />
          </YStack>
        ) : showErrorState ? (
          <MedicinesError onRetry={() => void loadMedicines(activeSearch)} />
        ) : (
          <FlatList
            contentContainerStyle={{ flexGrow: 1, gap: 12, paddingBottom: 96, paddingHorizontal: 20 }}
            data={medicines}
            keyboardShouldPersistTaps='handled'
            keyExtractor={(medicine) => medicine.uuid}
            ListEmptyComponent={showEmptyState ? <MedicinesEmpty hasActiveSearch={hasActiveSearch} /> : null}
            ListFooterComponent={
              isLoadingMore ? (
                <YStack items='center' py='$3'>
                  <ActivityIndicator color={colors.primary} />
                </YStack>
              ) : null
            }
            onEndReached={() => void loadMoreMedicines()}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                colors={[colors.primary]}
                onRefresh={() => void loadMedicines(activeSearch, true)}
                refreshing={isRefreshing}
                tintColor={colors.primary}
              />
            }
            renderItem={({ item }) => (
              <MedicineCard medicine={item} onPress={() => router.push(medicineRoutes.edit(item.uuid))} />
            )}
          />
        )}

        <Pressable
          accessibilityLabel='Cadastrar novo medicamento'
          onPress={() => router.push(routes.medicineForm)}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: 28,
            bottom: 20,
            elevation: 6,
            opacity: pressed ? 0.85 : 1,
            paddingHorizontal: 18,
            paddingVertical: 14,
            position: 'absolute',
            right: 20,
            shadowColor: palette.black,
            shadowOffset: { height: 3, width: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
          })}
        >
          <XStack gap='$2' items='center'>
            <PlusIcon color={palette.neutral0} size={20} weight='bold' />
            <Text fontSize={15} fontWeight='700' style={{ color: palette.neutral0 }}>
              Novo medicamento
            </Text>
          </XStack>
        </Pressable>
      </YStack>
    </MainLayout>
  );
}

export default function Medicines() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href={routes.login} />;

  return <MedicinesList />;
}
