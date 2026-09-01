import { Redirect, useFocusEffect } from 'expo-router';
import {
  ArrowClockwiseIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TagIcon,
  WarningCircleIcon,
  XCircleIcon,
} from 'phosphor-react-native';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';

import { InputField } from '../src/components/form/fields';
import { useAppColors } from '../src/components/main-layout';
import { ScreenHeader } from '../src/components/screen-header';
import { useAuth } from '../src/contexts/auth-context';
import { routes } from '../src/routes';
import {
  createMedicineBrand,
  getMedicineBrandErrorMessage,
  getMedicineBrands,
  type MedicineBrand,
  medicineBrandFormSchema,
  type PaginatedMeta,
  updateMedicineBrand,
} from '../src/services/medicines';
import { effectColors, palette } from '../src/theme';
import { safeFormatDate } from '../src/utils/date';

type BrandModalState = {
  brand: MedicineBrand | null;
  isOpen: boolean;
};

function BrandCard({ brand, onEdit }: { brand: MedicineBrand; onEdit: () => void }) {
  const colors = useAppColors();

  return (
    <Card borderWidth={1} p='$3' rounded='$4' style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <XStack gap='$3' items='center'>
        <XStack
          height={48}
          items='center'
          justify='center'
          rounded='$4'
          style={{ backgroundColor: colors.cardMuted }}
          width={48}
        >
          <TagIcon color={colors.primary} size={24} weight='fill' />
        </XStack>
        <YStack flex={1} gap='$1'>
          <Text fontSize={16} fontWeight='800' numberOfLines={1} style={{ color: colors.text }}>
            {brand.name}
          </Text>
          <Text fontSize={12} style={{ color: colors.muted }}>
            Cadastrada em {safeFormatDate(brand.createdAt)}
          </Text>
        </YStack>
        <Pressable
          accessibilityLabel={`Editar marca ${brand.name}`}
          onPress={onEdit}
          style={({ pressed }) => ({
            alignItems: 'center',
            backgroundColor: colors.cardMuted,
            borderColor: colors.border,
            borderRadius: 12,
            borderWidth: 1,
            height: 40,
            justifyContent: 'center',
            opacity: pressed ? 0.72 : 1,
            width: 40,
          })}
        >
          <PencilSimpleIcon color={colors.primary} size={19} weight='bold' />
        </Pressable>
      </XStack>
    </Card>
  );
}

function BrandsSkeleton() {
  const colors = useAppColors();

  return (
    <YStack gap='$3' pt='$2'>
      {[0, 1, 2, 3].map((item) => (
        <Card
          borderWidth={1}
          height={74}
          key={item}
          rounded='$4'
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        />
      ))}
      <Text style={{ color: colors.muted, textAlign: 'center' }}>Carregando marcas...</Text>
    </YStack>
  );
}

function BrandsError({ onRetry }: { onRetry: () => void }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6' style={{ minHeight: 260 }}>
      <WarningCircleIcon color={colors.warning} size={40} weight='fill' />
      <Text fontSize={17} fontWeight='700' style={{ color: colors.text, textAlign: 'center' }}>
        Não foi possível carregar as marcas.
      </Text>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>Verifique sua conexão e tente novamente.</Text>
      <Pressable
        accessibilityLabel='Tentar carregar as marcas novamente'
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

function BrandsEmpty({ hasActiveSearch }: { hasActiveSearch: boolean }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6' style={{ minHeight: 260 }}>
      <TagIcon color={colors.muted} size={44} weight='fill' />
      <Text fontSize={17} fontWeight='700' style={{ color: colors.text, textAlign: 'center' }}>
        {hasActiveSearch ? 'Nenhuma marca encontrada' : 'Nenhuma marca cadastrada'}
      </Text>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>
        {hasActiveSearch ? 'Ajuste a busca e tente novamente.' : 'Toque em Nova marca para cadastrar a primeira.'}
      </Text>
    </YStack>
  );
}

type BrandFormModalProps = {
  brand: MedicineBrand | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
};

function BrandFormModal({ brand, isOpen, onClose, onSaved }: BrandFormModalProps) {
  const colors = useAppColors();
  const isEdit = Boolean(brand);
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => {
    setName(brand?.name ?? '');
    setFieldError(undefined);
    setApiError(null);
  };

  const handleSubmit = async () => {
    const result = medicineBrandFormSchema.safeParse({ name });
    setApiError(null);

    if (!result.success) {
      setFieldError(result.error.issues[0]?.message);
      return;
    }

    setFieldError(undefined);
    setIsSubmitting(true);

    try {
      if (brand) await updateMedicineBrand(brand.uuid, { name: result.data.name.trim() });
      else await createMedicineBrand({ name: result.data.name.trim() });

      onSaved();
      onClose();
    } catch (error: unknown) {
      const fallback = isEdit
        ? 'Não foi possível atualizar a marca. Tente novamente.'
        : 'Não foi possível cadastrar a marca. Tente novamente.';
      setApiError(getMedicineBrandErrorMessage(error, fallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal animationType='fade' onRequestClose={onClose} onShow={handleOpen} transparent visible={isOpen}>
      <YStack flex={1} items='center' justify='center' px='$5' style={{ backgroundColor: effectColors.modalOverlay }}>
        <Card
          borderWidth={1}
          gap='$4'
          maxWidth={420}
          p='$5'
          rounded='$5'
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
          width='100%'
        >
          <YStack gap='$1'>
            <Text fontSize={19} fontWeight='800' style={{ color: colors.text }}>
              {isEdit ? 'Editar marca' : 'Nova marca'}
            </Text>
            <Text fontSize={13} style={{ color: colors.muted }}>
              {isEdit ? 'Atualize o nome da marca.' : 'Informe o nome da marca de medicamento.'}
            </Text>
          </YStack>

          <YStack gap='$2'>
            <InputField
              error={fieldError}
              label='Nome'
              maxLength={120}
              onChangeText={(value) => {
                setName(value);
                setFieldError(undefined);
                setApiError(null);
              }}
              placeholder='Ex.: Zoetis'
              required
              value={name}
            />
            {apiError ? (
              <Text fontSize={13} style={{ color: colors.danger }}>
                {apiError}
              </Text>
            ) : null}
          </YStack>

          <XStack gap='$2'>
            <Pressable
              accessibilityLabel='Cancelar'
              disabled={isSubmitting}
              onPress={onClose}
              style={({ pressed }) => ({
                alignItems: 'center',
                backgroundColor: colors.cardMuted,
                borderColor: colors.border,
                borderRadius: 12,
                borderWidth: 1,
                flex: 1,
                opacity: pressed ? 0.72 : 1,
                paddingVertical: 13,
              })}
            >
              <Text fontSize={15} fontWeight='700' style={{ color: colors.text }}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel={isEdit ? 'Salvar marca' : 'Cadastrar marca'}
              disabled={isSubmitting}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => ({
                alignItems: 'center',
                backgroundColor: colors.primary,
                borderRadius: 12,
                flex: 1,
                opacity: isSubmitting ? 0.6 : pressed ? 0.8 : 1,
                paddingVertical: 13,
              })}
            >
              {isSubmitting ? (
                <ActivityIndicator color={palette.neutral0} />
              ) : (
                <Text fontSize={15} fontWeight='700' style={{ color: palette.neutral0 }}>
                  {isEdit ? 'Salvar' : 'Cadastrar'}
                </Text>
              )}
            </Pressable>
          </XStack>
        </Card>
      </YStack>
    </Modal>
  );
}

function MedicineBrandsList() {
  const colors = useAppColors();
  const [brands, setBrands] = useState<MedicineBrand[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [modalState, setModalState] = useState<BrandModalState>({ brand: null, isOpen: false });
  const hasLoadedBrands = useRef(false);
  const requestIdRef = useRef(0);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadBrands = useCallback(async (search: string, isManualRefresh = false) => {
    const requestId = ++requestIdRef.current;

    if (isManualRefresh || hasLoadedBrands.current) setIsRefreshing(true);
    else setIsLoading(true);

    setHasError(false);

    try {
      const { data, meta: pageMeta } = await getMedicineBrands({ limit: 50, search: search || undefined });
      if (requestId !== requestIdRef.current) return;

      setBrands(data);
      setMeta(pageMeta);
      hasLoadedBrands.current = true;
    } catch {
      if (requestId === requestIdRef.current) setHasError(true);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  const loadMoreBrands = useCallback(async () => {
    if (isLoading || isRefreshing || isLoadingMore) return;
    if (!meta || meta.currentPage >= meta.totalPages) return;

    setIsLoadingMore(true);

    try {
      const { data, meta: pageMeta } = await getMedicineBrands({
        limit: 50,
        page: meta.currentPage + 1,
        search: activeSearch || undefined,
      });

      setBrands((current) => {
        const knownUuids = new Set(current.map((brand) => brand.uuid));
        return [...current, ...data.filter((brand) => !knownUuids.has(brand.uuid))];
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
      void loadBrands(activeSearch);
    }, [activeSearch, loadBrands]),
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
  const showErrorState = hasError && brands.length === 0;
  const showEmptyState = !isLoading && !showErrorState && brands.length === 0;
  const totalCount = meta?.totalItems ?? brands.length;

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScreenHeader description='Marcas dos medicamentos' title='Marcas' />
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
              accessibilityLabel='Buscar marca pelo nome'
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

          {!isLoading && !showErrorState && brands.length > 0 ? (
            <Text fontSize={13} style={{ color: colors.muted }}>
              {totalCount} {totalCount === 1 ? 'marca' : 'marcas'}
            </Text>
          ) : null}

          {hasError && brands.length > 0 ? (
            <Text fontSize={13} style={{ color: colors.muted }}>
              Não foi possível atualizar agora. Os últimos dados carregados continuam visíveis.
            </Text>
          ) : null}
        </YStack>

        {isLoading ? (
          <YStack flex={1} px='$5'>
            <BrandsSkeleton />
          </YStack>
        ) : showErrorState ? (
          <BrandsError onRetry={() => void loadBrands(activeSearch)} />
        ) : (
          <FlatList
            contentContainerStyle={{ flexGrow: 1, gap: 12, paddingBottom: 96, paddingHorizontal: 20 }}
            data={brands}
            keyboardShouldPersistTaps='handled'
            keyExtractor={(brand) => brand.uuid}
            ListEmptyComponent={showEmptyState ? <BrandsEmpty hasActiveSearch={hasActiveSearch} /> : null}
            ListFooterComponent={
              isLoadingMore ? (
                <YStack items='center' py='$3'>
                  <ActivityIndicator color={colors.primary} />
                </YStack>
              ) : null
            }
            onEndReached={() => void loadMoreBrands()}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                colors={[colors.primary]}
                onRefresh={() => void loadBrands(activeSearch, true)}
                refreshing={isRefreshing}
                tintColor={colors.primary}
              />
            }
            renderItem={({ item }) => (
              <BrandCard brand={item} onEdit={() => setModalState({ brand: item, isOpen: true })} />
            )}
          />
        )}

        <Pressable
          accessibilityLabel='Cadastrar nova marca'
          onPress={() => setModalState({ brand: null, isOpen: true })}
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
              Nova marca
            </Text>
          </XStack>
        </Pressable>

        <BrandFormModal
          brand={modalState.brand}
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ brand: null, isOpen: false })}
          onSaved={() => void loadBrands(activeSearch, true)}
        />
      </YStack>
    </SafeAreaView>
  );
}

export default function MedicineBrands() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href={routes.login} />;

  return <MedicineBrandsList />;
}
