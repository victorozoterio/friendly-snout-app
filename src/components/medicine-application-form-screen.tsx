import { useRouter } from 'expo-router';
import { CheckCircleIcon, WarningCircleIcon } from 'phosphor-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';

import { animalRoutes } from '../routes';
import { getAnimal } from '../services/animals';
import {
  createMedicineApplication,
  createMedicineApplicationFormValues,
  getMedicineApplicationErrorMessage,
  type MedicineApplicationFormFieldErrors,
  type MedicineApplicationFormValues,
  type MedicineApplicationFrequency,
  type MedicineApplicationKind,
  maskApplicationDate,
  maskApplicationTime,
  medicineApplicationFormSchema,
  parseApplicationDateTime,
} from '../services/medicine-applications';
import { getMedicines, type Medicine } from '../services/medicines';
import { palette } from '../theme';
import { ChoiceField, InputField } from './form/fields';
import { NativeDateTimeField } from './form/native-date-time-field';
import { LoadError, LoadingState } from './form/states';
import { useAppColors } from './main-layout';
import { ScreenHeader } from './screen-header';

type MedicineApplicationFormScreenProps = {
  animalUuid: string;
};

const kindOptions: { label: string; value: MedicineApplicationKind }[] = [
  { label: 'Agendada', value: 'scheduled' },
  { label: 'Já realizada', value: 'realized' },
];

const frequencyOptions: { label: string; value: MedicineApplicationFrequency }[] = [
  { label: 'Não se repete', value: 'não se repete' },
  { label: 'Diário', value: 'diário' },
  { label: 'Dias úteis', value: 'todos os dias da semana' },
  { label: 'Semanal', value: 'semanal' },
  { label: 'Mensal', value: 'mensal' },
  { label: 'Anual', value: 'anual' },
];

function getFieldErrors(issues: { path: PropertyKey[]; message: string }[]): MedicineApplicationFormFieldErrors {
  const errors: MedicineApplicationFormFieldErrors = {};
  for (const issue of issues) {
    const field = issue.path[0] as keyof MedicineApplicationFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

function getMedicineOptionLabel(medicine: Medicine) {
  const brand = medicine.medicineBrand?.name ? ` · ${medicine.medicineBrand.name}` : '';
  return `${medicine.name}${brand}`;
}

function formatPickerDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function formatPickerTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function MedicineApplicationFormScreen({ animalUuid }: MedicineApplicationFormScreenProps) {
  const router = useRouter();
  const colors = useAppColors();
  const [values, setValues] = useState(() => createMedicineApplicationFormValues());
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [animalName, setAnimalName] = useState('animal');
  const [fieldErrors, setFieldErrors] = useState<MedicineApplicationFormFieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadKey intentionally retries this request.
  useEffect(() => {
    let isActive = true;

    const loadFormData = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [animal, medicinesPage] = await Promise.all([getAnimal(animalUuid), getMedicines({ limit: 100 })]);
        if (!isActive) return;

        setAnimalName(animal.name);
        setMedicines(medicinesPage.data.filter((medicine) => medicine.isActive && medicine.quantity !== 0));
      } catch (error: unknown) {
        if (!isActive) return;
        setLoadError(getMedicineApplicationErrorMessage(error, 'Não foi possível carregar os dados para a aplicação.'));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadFormData();
    return () => {
      isActive = false;
    };
  }, [animalUuid, reloadKey]);

  const medicineOptions = useMemo(
    () => medicines.map((medicine) => ({ label: getMedicineOptionLabel(medicine), value: medicine.uuid })),
    [medicines],
  );
  const selectedMedicine = medicines.find((medicine) => medicine.uuid === values.medicineUuid);
  const pickerValue = parseApplicationDateTime(values.date, values.time) ?? new Date();
  const endPickerValue = parseApplicationDateTime(values.endDate, values.time) ?? pickerValue;
  const isRecurring = values.kind === 'scheduled' && values.frequency !== 'não se repete';
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const changeField = <K extends keyof MedicineApplicationFormValues>(
    field: K,
    value: MedicineApplicationFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setApiError(null);
  };

  const changeKind = (kind: MedicineApplicationKind) => {
    const dateValues = createMedicineApplicationFormValues(kind);
    setValues((current) => ({
      ...current,
      kind,
      date: dateValues.date,
      endDate: dateValues.endDate,
      time: dateValues.time,
    }));
    setFieldErrors((current) => ({
      ...current,
      date: undefined,
      endDate: undefined,
      kind: undefined,
      time: undefined,
    }));
    setApiError(null);
  };

  const handleSubmit = async () => {
    const result = medicineApplicationFormSchema.safeParse(values);
    setApiError(null);

    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error.issues));
      return;
    }

    const data = result.data;
    const quantity = Number(data.quantity);
    const applicationDate = parseApplicationDateTime(data.date, data.time);
    const endDate = parseApplicationDateTime(data.endDate, data.time);
    const isRecurringApplication = data.kind === 'scheduled' && data.frequency !== 'não se repete';
    const medicine = medicines.find((item) => item.uuid === data.medicineUuid);

    if (!applicationDate) return;
    if (medicine && medicine.quantity !== -1 && quantity > medicine.quantity) {
      setFieldErrors({ quantity: `Há somente ${medicine.quantity} unidade(s) disponível(is) em estoque` });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await createMedicineApplication(animalUuid, {
        medicineUuid: data.medicineUuid,
        quantity,
        appliedAt:
          data.kind === 'realized' || isRecurringApplication ? applicationDate.toISOString() : new Date().toISOString(),
        ...(data.kind === 'scheduled'
          ? {
              frequency: data.frequency,
              nextApplicationAt:
                isRecurringApplication && endDate ? endDate.toISOString() : applicationDate.toISOString(),
            }
          : {}),
      });

      Alert.alert(
        data.kind === 'scheduled' ? 'Aplicação agendada' : 'Aplicação registrada',
        data.kind === 'scheduled'
          ? 'A aplicação futura foi cadastrada com sucesso.'
          : 'A aplicação realizada foi adicionada ao histórico.',
      );
      router.dismissTo(animalRoutes.medicines(animalUuid) as never);
    } catch (error: unknown) {
      setApiError(
        getMedicineApplicationErrorMessage(
          error,
          data.kind === 'scheduled'
            ? 'Não foi possível criar o agendamento. Tente novamente.'
            : 'Não foi possível registrar a aplicação. Tente novamente.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScreenHeader description={`Medicamento para ${animalName}`} title='Nova aplicação' />
      {isLoading ? <LoadingState label='Carregando medicamentos...' /> : null}
      {!isLoading && loadError ? (
        <LoadError message={loadError} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : null}
      {!isLoading && !loadError ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 20 }}
          keyboardShouldPersistTaps='handled'
        >
          <YStack gap='$4'>
            {apiError ? (
              <Card
                borderWidth={1}
                p='$3'
                rounded='$4'
                style={{ backgroundColor: `${colors.danger}14`, borderColor: colors.danger }}
              >
                <XStack gap='$2' items='flex-start'>
                  <WarningCircleIcon color={colors.danger} size={21} weight='fill' />
                  <Text flex={1} fontSize={14} lineHeight={20} style={{ color: colors.danger }}>
                    {apiError}
                  </Text>
                </XStack>
              </Card>
            ) : null}

            <Card
              borderWidth={1}
              gap='$4'
              p='$4'
              rounded='$4'
              style={{ backgroundColor: colors.cardMuted, borderColor: colors.border }}
            >
              <ChoiceField
                label='Tipo de registro'
                onChange={changeKind}
                options={kindOptions}
                required
                value={values.kind}
              />

              <ChoiceField
                error={fieldErrors.medicineUuid}
                label='Medicamento'
                onChange={(value) => changeField('medicineUuid', value)}
                options={medicineOptions}
                required
                value={values.medicineUuid}
              />
              {medicineOptions.length === 0 ? (
                <Text fontSize={13} lineHeight={19} style={{ color: colors.muted }}>
                  Não há medicamentos ativos com estoque disponível. Cadastre ou atualize um medicamento antes de
                  continuar.
                </Text>
              ) : null}
              {selectedMedicine ? (
                <Text fontSize={13} style={{ color: colors.muted }}>
                  {selectedMedicine.quantity === -1
                    ? 'Estoque sem limite definido'
                    : `${selectedMedicine.quantity} unidade(s) disponível(is) em estoque`}
                </Text>
              ) : null}

              <InputField
                error={fieldErrors.quantity}
                keyboardType='number-pad'
                label='Quantidade / dosagem'
                maxLength={7}
                onChangeText={(value) => changeField('quantity', value.replace(/\D/g, ''))}
                placeholder='Ex.: 1'
                required
                value={values.quantity}
              />

              {values.kind === 'scheduled' ? (
                <ChoiceField
                  error={fieldErrors.frequency}
                  label='Frequência'
                  onChange={(value) => changeField('frequency', value)}
                  options={frequencyOptions}
                  required
                  value={values.frequency}
                />
              ) : null}

              <XStack gap='$3'>
                <YStack flex={1}>
                  <NativeDateTimeField
                    error={fieldErrors.date}
                    label={
                      values.kind === 'realized'
                        ? 'Data da aplicação'
                        : isRecurring
                          ? 'Data de início'
                          : 'Data agendada'
                    }
                    maximumDate={values.kind === 'realized' ? todayEnd : undefined}
                    minimumDate={values.kind === 'scheduled' ? todayStart : undefined}
                    mode='date'
                    onChange={(value) => changeField('date', formatPickerDate(value))}
                    onTextChange={(value) => changeField('date', maskApplicationDate(value))}
                    required
                    textValue={values.date}
                    value={pickerValue}
                  />
                </YStack>
                <YStack flex={0.72}>
                  <NativeDateTimeField
                    error={fieldErrors.time}
                    label='Horário'
                    mode='time'
                    onChange={(value) => changeField('time', formatPickerTime(value))}
                    onTextChange={(value) => changeField('time', maskApplicationTime(value))}
                    required
                    textValue={values.time}
                    value={pickerValue}
                  />
                </YStack>
              </XStack>

              {isRecurring ? (
                <YStack gap='$2'>
                  <NativeDateTimeField
                    error={fieldErrors.endDate}
                    label='Data de término'
                    minimumDate={pickerValue}
                    mode='date'
                    onChange={(value) => changeField('endDate', formatPickerDate(value))}
                    onTextChange={(value) => changeField('endDate', maskApplicationDate(value))}
                    required
                    textValue={values.endDate}
                    value={endPickerValue}
                  />
                  <Text fontSize={12} lineHeight={18} style={{ color: colors.muted }}>
                    O calendário marcará as ocorrências entre o início e o término, sempre no horário informado.
                  </Text>
                </YStack>
              ) : null}

              {values.kind === 'realized' ? (
                <XStack gap='$2' items='center'>
                  <CheckCircleIcon color={colors.success} size={20} weight='fill' />
                  <Text flex={1} fontSize={13} lineHeight={19} style={{ color: colors.muted }}>
                    Este registro será incluído diretamente no histórico de aplicações.
                  </Text>
                </XStack>
              ) : null}
            </Card>

            <Pressable
              accessibilityLabel={values.kind === 'scheduled' ? 'Agendar aplicação' : 'Registrar aplicação'}
              disabled={isSubmitting || medicineOptions.length === 0}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => ({
                alignItems: 'center',
                backgroundColor: colors.primary,
                borderRadius: 14,
                opacity: isSubmitting || medicineOptions.length === 0 ? 0.55 : pressed ? 0.8 : 1,
                paddingVertical: 15,
              })}
            >
              {isSubmitting ? (
                <ActivityIndicator color={palette.neutral0} />
              ) : (
                <Text fontSize={16} fontWeight='700' style={{ color: palette.neutral0 }}>
                  {values.kind === 'scheduled' ? 'Agendar aplicação' : 'Registrar aplicação'}
                </Text>
              )}
            </Pressable>
          </YStack>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
