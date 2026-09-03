import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowClockwiseIcon,
  CalendarCheckIcon,
  CheckCircleIcon,
  ClockCountdownIcon,
  PillIcon,
  PlusIcon,
  WarningCircleIcon,
  XCircleIcon,
} from 'phosphor-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';

import { useAppColors } from '../../src/components/main-layout';
import { ScreenHeader } from '../../src/components/screen-header';
import { useAuth } from '../../src/contexts/auth-context';
import { animalRoutes, routes } from '../../src/routes';
import { getAnimal } from '../../src/services/animals';
import {
  deleteMedicineApplication,
  formatApplicationDateTime,
  getMedicineApplicationErrorMessage,
  getMedicineApplicationsByAnimal,
  type MedicineApplication,
  type MedicineApplicationsMeta,
} from '../../src/services/medicine-applications';
import { effectColors, palette } from '../../src/theme';

type ApplicationSection = {
  title: string;
  description: string;
  kind: 'upcoming' | 'late' | 'history';
  data: MedicineApplication[];
};

function getApplicationTimestamp(application: MedicineApplication) {
  return new Date(application.nextApplicationAt ?? application.appliedAt).getTime();
}

function ApplicationStatusBadge({ kind }: { kind: ApplicationSection['kind'] }) {
  const colors = useAppColors();
  const badge = {
    upcoming: { color: colors.primary, label: 'Agendada' },
    late: { color: colors.danger, label: 'Em atraso' },
    history: { color: colors.success, label: 'Aplicada' },
  }[kind];

  return (
    <XStack px='$2' py='$1' rounded='$6' style={{ backgroundColor: `${badge.color}18` }}>
      <Text fontSize={11} fontWeight='800' style={{ color: badge.color }}>
        {badge.label}
      </Text>
    </XStack>
  );
}

function ApplicationCard({
  application,
  kind,
  onCancel,
}: {
  application: MedicineApplication;
  kind: ApplicationSection['kind'];
  onCancel: () => void;
}) {
  const colors = useAppColors();
  const date = application.nextApplicationAt ?? application.appliedAt;
  const isRecurring = kind !== 'history' && application.frequency && application.frequency !== 'não se repete';
  const dateLabel =
    kind === 'history'
      ? 'Aplicada em'
      : isRecurring
        ? 'Período agendado'
        : kind === 'late'
          ? 'Prevista para'
          : 'Agendada para';

  return (
    <Card borderWidth={1} p='$4' rounded='$4' style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <YStack gap='$3'>
        <XStack gap='$3' items='center'>
          <XStack
            height={44}
            items='center'
            justify='center'
            rounded='$4'
            style={{ backgroundColor: `${colors.primary}18` }}
            width={44}
          >
            <PillIcon color={colors.primary} size={23} weight='fill' />
          </XStack>
          <YStack flex={1} gap='$1'>
            <Text fontSize={17} fontWeight='800' numberOfLines={2} style={{ color: colors.text }}>
              {application.medicine?.name ?? 'Medicamento não informado'}
            </Text>
            <Text fontSize={13} style={{ color: colors.muted }}>
              {application.quantity} {application.quantity === 1 ? 'unidade' : 'unidades'}
            </Text>
          </YStack>
          <ApplicationStatusBadge kind={kind} />
        </XStack>

        <YStack gap='$1' pl='$1'>
          <Text fontSize={12} fontWeight='700' style={{ color: colors.muted }}>
            {dateLabel}
          </Text>
          <Text fontSize={15} fontWeight='700' style={{ color: colors.text }}>
            {isRecurring
              ? `${formatApplicationDateTime(application.appliedAt)} até ${formatApplicationDateTime(date)}`
              : formatApplicationDateTime(date)}
          </Text>
          {kind !== 'history' && application.frequency ? (
            <Text fontSize={13} style={{ color: colors.muted }}>
              Frequência: {application.frequency}
            </Text>
          ) : null}
        </YStack>

        {kind !== 'history' ? (
          <Pressable
            accessibilityLabel={`Cancelar agendamento de ${application.medicine?.name ?? 'medicamento'}`}
            onPress={onCancel}
            style={({ pressed }) => ({
              alignItems: 'center',
              borderColor: colors.danger,
              borderRadius: 12,
              borderWidth: 1,
              opacity: pressed ? 0.7 : 1,
              paddingHorizontal: 14,
              paddingVertical: 11,
            })}
          >
            <XStack gap='$2' items='center'>
              <XCircleIcon color={colors.danger} size={19} weight='bold' />
              <Text fontSize={14} fontWeight='700' style={{ color: colors.danger }}>
                {isRecurring ? 'Cancelar série' : 'Cancelar agendamento'}
              </Text>
            </XStack>
          </Pressable>
        ) : null}
      </YStack>
    </Card>
  );
}

function EmptyApplications() {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6' style={{ minHeight: 310 }}>
      <CalendarCheckIcon color={colors.muted} size={48} weight='fill' />
      <Text fontSize={18} fontWeight='800' style={{ color: colors.text, textAlign: 'center' }}>
        Nenhuma aplicação registrada
      </Text>
      <Text fontSize={14} lineHeight={20} style={{ color: colors.muted, textAlign: 'center' }}>
        Registre uma aplicação realizada ou cadastre o próximo horário de um medicamento.
      </Text>
    </YStack>
  );
}

function ApplicationsLoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6'>
      <WarningCircleIcon color={colors.warning} size={44} weight='fill' />
      <Text fontSize={17} fontWeight='700' style={{ color: colors.text, textAlign: 'center' }}>
        {message}
      </Text>
      <Pressable
        accessibilityLabel='Tentar carregar as aplicações novamente'
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

function AnimalMedicineApplications({ animalUuid }: { animalUuid: string }) {
  const router = useRouter();
  const colors = useAppColors();
  const [animalName, setAnimalName] = useState('animal');
  const [applications, setApplications] = useState<MedicineApplication[]>([]);
  const [meta, setMeta] = useState<MedicineApplicationsMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationToCancel, setApplicationToCancel] = useState<MedicineApplication | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const closeCancelDialog = useCallback(() => {
    if (isCancelling) return;
    setApplicationToCancel(null);
    setCancelError(null);
  }, [isCancelling]);

  const handleCancelApplication = useCallback(async () => {
    if (!applicationToCancel) return;

    const applicationUuid = applicationToCancel.uuid;
    setIsCancelling(true);
    setCancelError(null);

    try {
      await deleteMedicineApplication(applicationUuid);
      setApplications((current) => current.filter((application) => application.uuid !== applicationUuid));
      setMeta((current) => (current ? { ...current, totalItems: Math.max(0, current.totalItems - 1) } : current));
      setApplicationToCancel(null);
    } catch (cancelApplicationError: unknown) {
      setCancelError(
        getMedicineApplicationErrorMessage(
          cancelApplicationError,
          'Não foi possível cancelar o agendamento. Tente novamente.',
        ),
      );
    } finally {
      setIsCancelling(false);
    }
  }, [applicationToCancel]);

  const loadApplications = useCallback(
    async (manualRefresh = false) => {
      if (manualRefresh || hasLoaded.current) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      try {
        const [animal, applicationsPage] = await Promise.all([
          getAnimal(animalUuid),
          getMedicineApplicationsByAnimal(animalUuid),
        ]);
        setAnimalName(animal.name);
        setApplications(applicationsPage.data);
        setMeta(applicationsPage.meta);
        hasLoaded.current = true;
      } catch (loadError: unknown) {
        setError(
          getMedicineApplicationErrorMessage(loadError, 'Não foi possível carregar as aplicações deste animal.'),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [animalUuid],
  );

  const loadMoreApplications = useCallback(async () => {
    if (isLoading || isRefreshing || isLoadingMore || !meta || meta.currentPage >= meta.totalPages) return;

    setIsLoadingMore(true);
    try {
      const nextPage = await getMedicineApplicationsByAnimal(animalUuid, { page: meta.currentPage + 1 });
      setApplications((current) => {
        const knownUuids = new Set(current.map((application) => application.uuid));
        return [...current, ...nextPage.data.filter((application) => !knownUuids.has(application.uuid))];
      });
      setMeta(nextPage.meta);
    } catch (loadError: unknown) {
      setError(getMedicineApplicationErrorMessage(loadError, 'Não foi possível carregar mais aplicações.'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [animalUuid, isLoading, isLoadingMore, isRefreshing, meta]);

  useFocusEffect(
    useCallback(() => {
      void loadApplications();
    }, [loadApplications]),
  );

  const sections = useMemo<ApplicationSection[]>(() => {
    const now = Date.now();
    const upcoming = applications
      .filter((application) => application.nextApplicationAt && getApplicationTimestamp(application) > now)
      .sort((first, second) => getApplicationTimestamp(first) - getApplicationTimestamp(second));
    const late = applications
      .filter((application) => application.nextApplicationAt && getApplicationTimestamp(application) <= now)
      .sort((first, second) => getApplicationTimestamp(second) - getApplicationTimestamp(first));
    const history = applications
      .filter((application) => !application.nextApplicationAt)
      .sort((first, second) => getApplicationTimestamp(second) - getApplicationTimestamp(first));

    return [
      { data: late, description: 'Aplicações com horário já vencido', kind: 'late', title: 'Em atraso' },
      { data: upcoming, description: 'Próximas aplicações programadas', kind: 'upcoming', title: 'Próximas' },
      { data: history, description: 'Aplicações já realizadas', kind: 'history', title: 'Histórico' },
    ].filter((section) => section.data.length > 0) as ApplicationSection[];
  }, [applications]);

  const upcomingCount = applications.filter(
    (application) => application.nextApplicationAt && getApplicationTimestamp(application) > Date.now(),
  ).length;
  const historyCount = applications.filter((application) => !application.nextApplicationAt).length;
  const showBlockingError = Boolean(error && applications.length === 0);

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScreenHeader description={`Aplicações de ${animalName}`} title='Agenda de medicamentos' />
      {isLoading ? (
        <YStack flex={1} gap='$3' items='center' justify='center'>
          <ActivityIndicator color={colors.primary} size='large' />
          <Text style={{ color: colors.muted }}>Carregando aplicações...</Text>
        </YStack>
      ) : showBlockingError ? (
        <ApplicationsLoadError message={error ?? ''} onRetry={() => void loadApplications()} />
      ) : (
        <SectionList
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100, paddingHorizontal: 20 }}
          ItemSeparatorComponent={() => <YStack height={10} />}
          keyExtractor={(application) => application.uuid}
          ListEmptyComponent={<EmptyApplications />}
          ListHeaderComponent={
            <YStack gap='$3' pb='$5'>
              <XStack gap='$3'>
                <Card
                  borderWidth={1}
                  flex={1}
                  gap='$1'
                  p='$3'
                  rounded='$4'
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                  <ClockCountdownIcon color={colors.primary} size={22} weight='fill' />
                  <Text fontSize={22} fontWeight='800' style={{ color: colors.text }}>
                    {upcomingCount}
                  </Text>
                  <Text fontSize={12} style={{ color: colors.muted }}>
                    {upcomingCount === 1 ? 'próxima aplicação' : 'próximas aplicações'}
                  </Text>
                </Card>
                <Card
                  borderWidth={1}
                  flex={1}
                  gap='$1'
                  p='$3'
                  rounded='$4'
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                  <CheckCircleIcon color={colors.success} size={22} weight='fill' />
                  <Text fontSize={22} fontWeight='800' style={{ color: colors.text }}>
                    {historyCount}
                  </Text>
                  <Text fontSize={12} style={{ color: colors.muted }}>
                    {historyCount === 1 ? 'aplicação realizada' : 'aplicações realizadas'}
                  </Text>
                </Card>
              </XStack>
              {error ? (
                <Text fontSize={13} style={{ color: colors.muted }}>
                  Não foi possível atualizar agora. Os últimos dados carregados continuam visíveis.
                </Text>
              ) : null}
            </YStack>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <YStack items='center' py='$4'>
                <ActivityIndicator color={colors.primary} />
              </YStack>
            ) : null
          }
          onEndReached={() => void loadMoreApplications()}
          onEndReachedThreshold={0.35}
          refreshControl={
            <RefreshControl
              colors={[colors.primary]}
              onRefresh={() => void loadApplications(true)}
              refreshing={isRefreshing}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item, section }) => (
            <ApplicationCard
              application={item}
              kind={section.kind}
              onCancel={() => {
                setCancelError(null);
                setApplicationToCancel(item);
              }}
            />
          )}
          renderSectionHeader={({ section }) => (
            <YStack gap='$1' pb='$3' pt='$5' style={{ backgroundColor: colors.background }}>
              <Text fontSize={19} fontWeight='800' style={{ color: colors.text }}>
                {section.title}
              </Text>
              <Text fontSize={13} style={{ color: colors.muted }}>
                {section.description}
              </Text>
            </YStack>
          )}
          sections={sections}
          stickySectionHeadersEnabled={false}
        />
      )}

      {!isLoading && !showBlockingError ? (
        <Pressable
          accessibilityLabel='Cadastrar nova aplicação de medicamento'
          onPress={() => router.push(animalRoutes.createMedicineApplication(animalUuid) as never)}
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
              Nova aplicação
            </Text>
          </XStack>
        </Pressable>
      ) : null}

      <Modal animationType='fade' onRequestClose={closeCancelDialog} transparent visible={Boolean(applicationToCancel)}>
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
            <YStack gap='$3' items='center'>
              <XStack
                height={52}
                items='center'
                justify='center'
                rounded='$4'
                style={{ backgroundColor: `${colors.danger}16` }}
                width={52}
              >
                <XCircleIcon color={colors.danger} size={28} weight='fill' />
              </XStack>
              <YStack gap='$2'>
                <Text fontSize={20} fontWeight='800' style={{ color: colors.text, textAlign: 'center' }}>
                  {applicationToCancel?.frequency && applicationToCancel.frequency !== 'não se repete'
                    ? 'Cancelar série de aplicações?'
                    : 'Cancelar agendamento?'}
                </Text>
                <Text fontSize={14} lineHeight={20} style={{ color: colors.muted, textAlign: 'center' }}>
                  {applicationToCancel?.frequency && applicationToCancel.frequency !== 'não se repete'
                    ? `Todas as aplicações agendadas de ${applicationToCancel.medicine?.name ?? 'medicamento'} nesta série serão canceladas.`
                    : `A aplicação agendada de ${applicationToCancel?.medicine?.name ?? 'medicamento'} será cancelada.`}
                </Text>
              </YStack>
            </YStack>

            {cancelError ? (
              <Card
                borderWidth={1}
                p='$3'
                rounded='$3'
                style={{ backgroundColor: `${colors.danger}12`, borderColor: colors.danger }}
              >
                <XStack gap='$2' items='flex-start'>
                  <WarningCircleIcon color={colors.danger} size={20} weight='fill' />
                  <Text flex={1} fontSize={13} lineHeight={19} style={{ color: colors.danger }}>
                    {cancelError}
                  </Text>
                </XStack>
              </Card>
            ) : null}

            <XStack gap='$3'>
              <Pressable
                accessibilityLabel='Voltar sem cancelar o agendamento'
                disabled={isCancelling}
                onPress={closeCancelDialog}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  backgroundColor: colors.cardMuted,
                  borderColor: colors.border,
                  borderRadius: 13,
                  borderWidth: 1,
                  flex: 1,
                  justifyContent: 'center',
                  opacity: isCancelling ? 0.55 : pressed ? 0.72 : 1,
                  paddingHorizontal: 12,
                  paddingVertical: 13,
                })}
              >
                <Text fontSize={14} fontWeight='700' style={{ color: colors.text }}>
                  Voltar
                </Text>
              </Pressable>

              <Pressable
                accessibilityLabel='Confirmar cancelamento do agendamento'
                disabled={isCancelling}
                onPress={() => void handleCancelApplication()}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  backgroundColor: colors.danger,
                  borderRadius: 13,
                  flex: 1,
                  justifyContent: 'center',
                  opacity: isCancelling ? 0.58 : pressed ? 0.78 : 1,
                  paddingHorizontal: 12,
                  paddingVertical: 13,
                })}
              >
                <XStack gap='$2' items='center'>
                  {isCancelling ? <ActivityIndicator color={palette.neutral0} size='small' /> : null}
                  <Text fontSize={14} fontWeight='800' style={{ color: palette.neutral0 }}>
                    {isCancelling ? 'Cancelando...' : 'Cancelar agendamento'}
                  </Text>
                </XStack>
              </Pressable>
            </XStack>
          </Card>
        </YStack>
      </Modal>
    </SafeAreaView>
  );
}

export default function AnimalMedicinesScreen() {
  const { animalUuid } = useLocalSearchParams<{ animalUuid: string }>();
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href={routes.login} />;
  if (!animalUuid) return <Redirect href={routes.animals} />;

  return <AnimalMedicineApplications animalUuid={animalUuid} />;
}
