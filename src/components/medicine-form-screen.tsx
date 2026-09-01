import { useRouter } from 'expo-router';
import { WarningCircleIcon } from 'phosphor-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';

import { routes } from '../routes';
import {
  createMedicine,
  emptyMedicineFormValues,
  getMedicine,
  getMedicineBrands,
  getMedicineErrorMessage,
  type Medicine,
  type MedicineBrand,
  type MedicineFormFieldErrors,
  type MedicineFormValues,
  medicineFormSchema,
  updateMedicine,
} from '../services/medicines';
import { palette } from '../theme';
import { ChoiceField, InputField } from './form/fields';
import { LoadError, LoadingState } from './form/states';
import { useAppColors } from './main-layout';
import { ScreenHeader } from './screen-header';

type MedicineFormScreenProps = {
  medicineUuid?: string;
};

function toMedicineFormValues(medicine: Medicine): MedicineFormValues {
  return {
    name: medicine.name,
    description: medicine.description ?? '',
    quantity: String(medicine.quantity),
    medicineBrandUuid: medicine.medicineBrand?.uuid ?? '',
  };
}

function mergeMedicineBrand(brands: MedicineBrand[], medicine: Medicine | null): MedicineBrand[] {
  const medicineBrand = medicine?.medicineBrand;
  if (!medicineBrand) return brands;
  if (brands.some((brand) => brand.uuid === medicineBrand.uuid)) return brands;
  return [medicineBrand, ...brands];
}

function getMedicineFormFieldErrors(issues: { path: PropertyKey[]; message: string }[]): MedicineFormFieldErrors {
  const errors: MedicineFormFieldErrors = {};
  for (const issue of issues) {
    const field = issue.path[0] as keyof MedicineFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export function MedicineFormScreen({ medicineUuid }: MedicineFormScreenProps) {
  const isEdit = Boolean(medicineUuid);
  const router = useRouter();
  const colors = useAppColors();
  const [values, setValues] = useState<MedicineFormValues>(emptyMedicineFormValues);
  const [brands, setBrands] = useState<MedicineBrand[]>([]);
  const [fieldErrors, setFieldErrors] = useState<MedicineFormFieldErrors>({});
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
        const [availableBrands, medicine] = await Promise.all([
          getMedicineBrands(),
          medicineUuid ? getMedicine(medicineUuid) : Promise.resolve(null),
        ]);
        if (!isActive) return;

        setBrands(mergeMedicineBrand(availableBrands.data, medicine));
        setValues(medicine ? toMedicineFormValues(medicine) : emptyMedicineFormValues);
        setFieldErrors({});
        setApiError(null);
      } catch (error: unknown) {
        if (!isActive) return;

        const fallback = isEdit
          ? 'Não foi possível carregar os dados do medicamento.'
          : 'Não foi possível carregar as marcas.';
        setLoadError(getMedicineErrorMessage(error, fallback));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadFormData();
    return () => {
      isActive = false;
    };
  }, [medicineUuid, isEdit, reloadKey]);

  const brandOptions = useMemo(() => brands.map((brand) => ({ label: brand.name, value: brand.uuid })), [brands]);

  const changeField = <K extends keyof MedicineFormValues>(field: K, value: MedicineFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setApiError(null);
  };

  const handleSubmit = async () => {
    const result = medicineFormSchema.safeParse(values);
    setApiError(null);

    if (!result.success) {
      setFieldErrors(getMedicineFormFieldErrors(result.error.issues));
      return;
    }

    const data = result.data;
    const input = {
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      quantity: Number(data.quantity),
      medicineBrandUuid: data.medicineBrandUuid,
    };

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      if (medicineUuid) {
        await updateMedicine(medicineUuid, input);
        Alert.alert('Medicamento atualizado', 'As alterações foram salvas com sucesso.');
        router.back();
        return;
      }

      await createMedicine(input);
      Alert.alert('Medicamento cadastrado', 'O novo medicamento foi cadastrado com sucesso.');
      router.replace(routes.medicines);
    } catch (error: unknown) {
      const fallback = isEdit
        ? 'Não foi possível atualizar o medicamento. Tente novamente.'
        : 'Não foi possível cadastrar o medicamento. Tente novamente.';
      setApiError(getMedicineErrorMessage(error, fallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScreenHeader
        description={isEdit ? 'Atualize as informações cadastradas' : 'Cadastre um novo medicamento'}
        title={isEdit ? 'Editar medicamento' : 'Novo medicamento'}
      />
      {isLoading ? (
        <LoadingState label={isEdit ? 'Carregando dados do medicamento...' : 'Carregando marcas...'} />
      ) : null}
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
            <Text fontSize={12} style={{ color: colors.muted }}>
              Campos marcados com * são obrigatórios.
            </Text>
            <Card
              borderWidth={1}
              gap='$3'
              p='$4'
              rounded='$4'
              style={{ backgroundColor: colors.cardMuted, borderColor: colors.border }}
            >
              <InputField
                error={fieldErrors.name}
                label='Nome'
                maxLength={120}
                onChangeText={(value) => changeField('name', value)}
                placeholder='Ex.: Vermífugo'
                required
                value={values.name}
              />
              <ChoiceField
                error={fieldErrors.medicineBrandUuid}
                label='Marca'
                onChange={(value) => changeField('medicineBrandUuid', value)}
                options={brandOptions}
                required
                value={values.medicineBrandUuid}
              />
              {brandOptions.length === 0 ? (
                <Text fontSize={13} style={{ color: colors.muted }}>
                  Nenhuma marca cadastrada. Cadastre uma marca em Medicamentos → Gerenciar marcas.
                </Text>
              ) : null}
              <InputField
                error={fieldErrors.quantity}
                keyboardType='number-pad'
                label='Quantidade em estoque'
                maxLength={7}
                onChangeText={(value) => changeField('quantity', value)}
                placeholder='Ex.: 10'
                required
                value={values.quantity}
              />
              <InputField
                error={fieldErrors.description}
                label='Descrição'
                maxLength={400}
                multiline
                onChangeText={(value) => changeField('description', value)}
                placeholder='Informações adicionais sobre o medicamento'
                value={values.description}
              />
            </Card>
            <Pressable
              accessibilityLabel={isEdit ? 'Salvar alterações' : 'Cadastrar medicamento'}
              disabled={isSubmitting}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => ({
                alignItems: 'center',
                backgroundColor: colors.primary,
                borderRadius: 14,
                opacity: isSubmitting ? 0.6 : pressed ? 0.8 : 1,
                paddingVertical: 15,
              })}
            >
              {isSubmitting ? (
                <ActivityIndicator color={palette.neutral0} />
              ) : (
                <Text fontSize={16} fontWeight='700' style={{ color: palette.neutral0 }}>
                  {isEdit ? 'Salvar alterações' : 'Cadastrar medicamento'}
                </Text>
              )}
            </Pressable>
          </YStack>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
