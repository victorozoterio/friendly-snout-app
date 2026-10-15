import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowClockwiseIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CaretRightIcon,
  PaperclipIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  WarningCircleIcon,
} from 'phosphor-react-native';
import { useCallback, useRef, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';
import { AnimalProfilePhoto } from '../../src/components/animal-profile-photo';
import { AnimalStageBadge } from '../../src/components/animal-stage-badge';
import { useAppColors } from '../../src/components/main-layout';
import { MedicineApplicationCalendar } from '../../src/components/medicine-application-calendar';
import { useAppDialog } from '../../src/contexts/app-dialog-context';
import { useAuth } from '../../src/contexts/auth-context';
import { animalRoutes, routes } from '../../src/routes';
import {
  type Animal,
  deleteAnimal,
  getAnimal,
  getAnimalErrorMessage,
  updateAnimalPhoto,
} from '../../src/services/animals';
import { type Attachment, getAnimalAttachments } from '../../src/services/attachments';
import { getMedicineApplicationsByAnimal, type MedicineApplication } from '../../src/services/medicine-applications';
import { actionColors, palette } from '../../src/theme';
import { getAttachmentName, isImageAttachment } from '../../src/utils/attachment';
import { safeCapitalize, safeFormatAge, safeFormatBirthDate, safeFormatDate } from '../../src/utils/date';

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
        height={200}
        rounded='$4'
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      />
      <XStack height={28} rounded='$3' style={{ backgroundColor: colors.cardMuted }} width={180} />
      <Card
        borderWidth={1}
        height={240}
        rounded='$4'
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      />
      <Text style={{ color: colors.muted, textAlign: 'center' }}>Carregando dados do animal...</Text>
    </YStack>
  );
}

function AnimalDetailsError({ onRetry, onBack }: { onBack: () => void; onRetry: () => void }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6' style={{ minHeight: 320 }}>
      <WarningCircleIcon color={colors.warning} size={48} weight='fill' />
      <Text fontSize={18} fontWeight='800' style={{ color: colors.text, textAlign: 'center' }}>
        Não foi possível carregar os dados do animal.
      </Text>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>
        Verifique sua conexão ou se o animal ainda existe no sistema.
      </Text>
      <XStack gap='$3' mt='$2'>
        <Pressable
          accessibilityLabel='Voltar para a lista'
          onPress={onBack}
          style={({ pressed }) => ({
            backgroundColor: colors.cardMuted,
            borderColor: colors.border,
            borderRadius: 12,
            borderWidth: 1,
            opacity: pressed ? 0.75 : 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
          })}
        >
          <Text fontWeight='700' style={{ color: colors.text }}>
            Voltar
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel='Tentar carregar os dados novamente'
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
      </XStack>
    </YStack>
  );
}

function AnimalDetailsContent({
  animal,
  onPhotoUpdated,
}: {
  animal: Animal;
  onPhotoUpdated: (animal: Animal) => void;
}) {
  const colors = useAppColors();
  const { confirm, showError, showSuccess } = useAppDialog();
  const router = useRouter();
  const [recentAttachments, setRecentAttachments] = useState<Attachment[]>([]);
  const [scheduledApplications, setScheduledApplications] = useState<MedicineApplication[]>([]);
  const [isAgendaLoading, setIsAgendaLoading] = useState(true);
  const [hasAgendaError, setHasAgendaError] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  const notInformed = 'Não informado';
  const isFeline = animal.species.name.trim().toLocaleLowerCase('pt-BR') === 'gato';

  const loadPreviewData = useCallback(async () => {
    setIsAgendaLoading(true);
    setHasAgendaError(false);

    const [attachmentsResult, applicationsResult] = await Promise.allSettled([
      getAnimalAttachments(animal.uuid),
      getMedicineApplicationsByAnimal(animal.uuid),
    ]);

    if (attachmentsResult.status === 'fulfilled') {
      setRecentAttachments(attachmentsResult.value.data.slice(0, 3));
    } else {
      setRecentAttachments([]);
    }

    if (applicationsResult.status === 'fulfilled') {
      setScheduledApplications(
        applicationsResult.value.data.filter((application) => Boolean(application.nextApplicationAt)),
      );
    } else {
      setHasAgendaError(true);
    }

    setIsAgendaLoading(false);
  }, [animal.uuid]);

  useFocusEffect(
    useCallback(() => {
      void loadPreviewData();
    }, [loadPreviewData]),
  );

  const handleDelete = async () => {
    try {
      await deleteAnimal(animal.uuid);
      showSuccess({ description: `${animal.name} foi removido com sucesso.`, title: 'Animal excluído' });
      router.dismissTo(routes.animals);
    } catch (error: unknown) {
      showError({
        description: getAnimalErrorMessage(error, 'Não foi possível excluir o animal. Tente novamente.'),
        title: 'Não foi possível excluir o animal',
      });
    }
  };

  const handlePhotoSelected = async (photo: Parameters<typeof updateAnimalPhoto>[1]) => {
    setIsPhotoUploading(true);

    try {
      onPhotoUpdated(await updateAnimalPhoto(animal.uuid, photo));
    } catch (error: unknown) {
      showError({
        description: getAnimalErrorMessage(error, 'Tente novamente.'),
        title: 'Não foi possível atualizar a foto',
      });
    } finally {
      setIsPhotoUploading(false);
    }
  };

  const generalRows = [
    { label: 'Espécie', value: animal.species.name },
    { label: 'Raça', value: animal.breed.name },
    { label: 'Sexo', value: safeCapitalize(animal.sex) },
    { label: 'Porte', value: safeCapitalize(animal.size) },
    { label: 'Cor', value: animal.color },
    {
      label: 'Nascimento',
      value: animal.birthDate
        ? `${safeFormatBirthDate(animal.birthDate)}${safeFormatAge(animal.birthDate) ? ` (${safeFormatAge(animal.birthDate)})` : ''}`
        : notInformed,
    },
  ];

  const healthRows = [
    { label: 'Castrado', value: animal.castrated ? 'Sim' : 'Não' },
    ...(isFeline
      ? [
          { label: 'FIV', value: safeCapitalize(animal.fiv) },
          { label: 'FELV', value: safeCapitalize(animal.felv) },
        ]
      : []),
  ];

  const identificationRows = [
    { label: 'Microchip', value: animal.microchip || notInformed },
    { label: 'RGA', value: animal.rga || notInformed },
  ];

  return (
    <YStack gap='$4' pb='$8'>
      <YStack px='$5' pt='$4'>
        <XStack items='center' justify='space-between'>
          <Pressable
            accessibilityLabel='Voltar'
            onPress={() => router.back()}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: 14,
              borderWidth: 1,
              height: 44,
              justifyContent: 'center',
              opacity: pressed ? 0.76 : 1,
              width: 44,
            })}
          >
            <ArrowLeftIcon color={colors.text} size={22} weight='bold' />
          </Pressable>

          <Pressable
            accessibilityLabel={`Editar cadastro de ${animal.name}`}
            onPress={() => router.push(animalRoutes.edit(animal.uuid))}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: 14,
              borderWidth: 1,
              height: 44,
              justifyContent: 'center',
              opacity: pressed ? 0.76 : 1,
              width: 44,
            })}
          >
            <PencilSimpleIcon color={colors.text} size={22} weight='bold' />
          </Pressable>
        </XStack>
      </YStack>

      <YStack items='center'>
        <AnimalProfilePhoto
          isLoading={isPhotoUploading}
          onPhotoSelected={handlePhotoSelected}
          photoUrl={animal.photoUrl}
          speciesName={animal.species.name}
        />
        <YStack gap='$2' items='center' mt='$3' px='$5'>
          <Text fontSize={26} fontWeight='800' style={{ color: colors.text, textAlign: 'center' }}>
            {animal.name}
          </Text>
          <AnimalStageBadge stage={animal.status} />
          <Text fontSize={15} style={{ color: colors.muted, textAlign: 'center' }}>
            {animal.species.name} • {animal.breed.name}
          </Text>
        </YStack>
      </YStack>

      <YStack gap='$5' px='$5'>
        {/* Cadastral Info Cards */}
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

        {/* Separator Line */}
        <YStack my='$1' style={{ borderTopColor: colors.border, borderTopWidth: 1 }} />

        {/* Anexos Section */}
        <YStack gap='$3'>
          <XStack items='center' justify='space-between'>
            <XStack gap='$2' items='center'>
              <PaperclipIcon color={colors.primary} size={22} weight='fill' />
              <Text fontSize={18} fontWeight='800' style={{ color: colors.text }}>
                Anexos
              </Text>
            </XStack>
            <Pressable
              accessibilityLabel='Ver todos os anexos'
              onPress={() => router.push(animalRoutes.attachments(animal.uuid))}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <XStack gap='$1' items='center'>
                <Text fontSize={14} fontWeight='700' style={{ color: colors.primary }}>
                  Ver anexos
                </Text>
                <CaretRightIcon color={colors.primary} size={18} weight='bold' />
              </XStack>
            </Pressable>
          </XStack>

          {recentAttachments.length === 0 ? (
            <Card
              borderWidth={1}
              p='$3'
              rounded='$4'
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <XStack gap='$3' items='center'>
                <PaperclipIcon color={colors.muted} size={20} />
                <Text fontSize={14} style={{ color: colors.muted }}>
                  Nenhuma foto ou documento anexado.
                </Text>
              </XStack>
            </Card>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap='$2' py='$1'>
                {recentAttachments.map((attachment) => (
                  <Pressable
                    key={attachment.uuid}
                    onPress={() => router.push(animalRoutes.attachments(animal.uuid))}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  >
                    <Card
                      borderWidth={1}
                      height={76}
                      overflow='hidden'
                      rounded='$3'
                      style={{ backgroundColor: colors.card, borderColor: colors.border }}
                      width={76}
                    >
                      {isImageAttachment(attachment) ? (
                        <Image
                          resizeMode='cover'
                          source={{ uri: attachment.url }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      ) : (
                        <YStack flex={1} gap='$1' items='center' justify='center' p='$2'>
                          <PaperclipIcon color={colors.primary} size={22} weight='fill' />
                          <Text fontSize={10} numberOfLines={2} style={{ color: colors.text, textAlign: 'center' }}>
                            {getAttachmentName(attachment)}
                          </Text>
                        </YStack>
                      )}
                    </Card>
                  </Pressable>
                ))}
                <Pressable
                  accessibilityLabel='Ver todos os anexos'
                  onPress={() => router.push(animalRoutes.attachments(animal.uuid))}
                  style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
                >
                  <Card
                    borderWidth={1}
                    height={76}
                    items='center'
                    justify='center'
                    rounded='$3'
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    width={76}
                  >
                    <CaretRightIcon color={colors.primary} size={24} weight='bold' />
                  </Card>
                </Pressable>
              </XStack>
            </ScrollView>
          )}
        </YStack>

        {/* Separator Line */}
        <YStack my='$1' style={{ borderTopColor: colors.border, borderTopWidth: 1 }} />

        {/* Agenda / Medicamentos Section */}
        <YStack gap='$3'>
          <XStack items='center' justify='space-between'>
            <XStack gap='$2' items='center'>
              <CalendarIcon color={colors.primary} size={22} weight='fill' />
              <Text fontSize={18} fontWeight='800' style={{ color: colors.text }}>
                Agenda
              </Text>
            </XStack>
            <Pressable
              accessibilityLabel='Ver histórico de medicamentos'
              onPress={() => router.push(animalRoutes.medicines(animal.uuid))}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <XStack gap='$1' items='center'>
                <Text fontSize={14} fontWeight='700' style={{ color: colors.primary }}>
                  Ver tudo
                </Text>
                <CaretRightIcon color={colors.primary} size={18} weight='bold' />
              </XStack>
            </Pressable>
          </XStack>

          <MedicineApplicationCalendar
            applications={scheduledApplications}
            hasError={hasAgendaError}
            isLoading={isAgendaLoading}
          />
        </YStack>

        {/* Action Buttons Section */}
        <YStack gap='$3' mt='$4'>
          {/* Agendar Medicamento */}
          <Pressable
            accessibilityLabel='Agendar Medicamento'
            onPress={() => router.push(animalRoutes.createMedicineApplication(animal.uuid) as never)}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: actionColors.medicine,
              borderRadius: 14,
              opacity: pressed ? 0.78 : 1,
              paddingHorizontal: 16,
              paddingVertical: 14,
            })}
          >
            <XStack gap='$2' items='center' justify='center'>
              <PlusIcon color={palette.neutral0} size={20} weight='bold' />
              <Text fontSize={15} fontWeight='800' style={{ color: palette.neutral0 }}>
                Agendar Medicamento
              </Text>
            </XStack>
          </Pressable>

          {/* Adicionar Anexo */}
          <Pressable
            accessibilityLabel='Adicionar Anexo'
            onPress={() => router.push(animalRoutes.attachments(animal.uuid))}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: actionColors.attachment,
              borderRadius: 14,
              opacity: pressed ? 0.78 : 1,
              paddingHorizontal: 16,
              paddingVertical: 14,
            })}
          >
            <XStack gap='$2' items='center' justify='center'>
              <PlusIcon color={palette.neutral0} size={20} weight='bold' />
              <Text fontSize={15} fontWeight='800' style={{ color: palette.neutral0 }}>
                Adicionar Anexo
              </Text>
            </XStack>
          </Pressable>

          {/* Apagar */}
          <Pressable
            accessibilityLabel={`Excluir ${animal.name}`}
            onPress={() =>
              confirm({
                confirmLabel: 'Excluir',
                description: `${animal.name} será removido permanentemente. Esta ação não pode ser desfeita.`,
                destructive: true,
                onConfirm: handleDelete,
                title: 'Excluir animal?',
              })
            }
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: actionColors.destructive,
              borderRadius: 14,
              opacity: pressed ? 0.78 : 1,
              paddingHorizontal: 16,
              paddingVertical: 14,
            })}
          >
            <XStack gap='$2' items='center' justify='center'>
              <TrashIcon color={palette.neutral0} size={20} weight='bold' />
              <Text fontSize={15} fontWeight='800' style={{ color: palette.neutral0 }}>
                Apagar
              </Text>
            </XStack>
          </Pressable>
        </YStack>

        <Text fontSize={12} style={{ color: colors.muted, textAlign: 'center' }}>
          Cadastrado em {safeFormatDate(animal.createdAt)}
        </Text>
      </YStack>
    </YStack>
  );
}

function AnimalDetails() {
  const { animalUuid } = useLocalSearchParams<{ animalUuid: string }>();
  const router = useRouter();
  const colors = useAppColors();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hasLoadedAnimal = useRef(false);

  const loadAnimal = useCallback(
    async (isManualRefresh = false) => {
      if (!animalUuid) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

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
        {hasError && !animal ? (
          <AnimalDetailsError onBack={() => router.back()} onRetry={() => void loadAnimal()} />
        ) : null}
        {animal ? (
          <YStack>
            {hasError ? (
              <Text fontSize={13} px='$5' py='$2' style={{ color: colors.muted, textAlign: 'center' }}>
                Não foi possível atualizar agora. Os últimos dados carregados continuam visíveis.
              </Text>
            ) : null}
            <AnimalDetailsContent animal={animal} onPhotoUpdated={setAnimal} />
          </YStack>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function AnimalDetailsScreen() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href={routes.login} />;

  return <AnimalDetails />;
}
