import { useRouter } from 'expo-router';
import { WarningCircleIcon } from 'phosphor-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';
import { routes } from '../routes';
import {
  type AnimalFormFieldErrors,
  type AnimalFormValues,
  type AnimalSpeciesOption,
  type CreateAnimalInput,
  createAnimal,
  emptyAnimalFormValues,
  getAnimal,
  getAnimalErrorMessage,
  getAnimalFormSchema,
  getAnimalSpecies,
  toApiBirthDate,
  updateAnimal,
} from '../services/animals';
import {
  getAnimalFormFieldErrors,
  isFelineSpecies,
  mergeAnimalIntoSpecies,
  toAnimalFormValues,
} from '../utils/animal-form';
import { AnimalFormActions } from './animal-form/actions';
import { animalFormSteps } from './animal-form/constants';
import { FormSection, ProgressIndicator } from './animal-form/fields';
import { LoadError, LoadingState } from './animal-form/states';
import { AnimalFormStepContent } from './animal-form/step-content';
import { useAppColors } from './main-layout';
import { ScreenHeader } from './screen-header';

type AnimalFormScreenProps = {
  animalUuid?: string;
};

export function AnimalFormScreen({ animalUuid }: AnimalFormScreenProps) {
  const isEdit = Boolean(animalUuid);
  const router = useRouter();
  const colors = useAppColors();
  const scrollRef = useRef<ScrollView>(null);
  const [values, setValues] = useState<AnimalFormValues>(emptyAnimalFormValues);
  const [species, setSpecies] = useState<AnimalSpeciesOption[]>([]);
  const [fieldErrors, setFieldErrors] = useState<AnimalFormFieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadKey intentionally retries this request.
  useEffect(() => {
    let isActive = true;

    const loadFormData = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [availableSpecies, animal] = await Promise.all([
          getAnimalSpecies(),
          animalUuid ? getAnimal(animalUuid) : Promise.resolve(null),
        ]);
        if (!isActive) return;
        if (availableSpecies.length === 0) throw new Error('No species available');

        setSpecies(mergeAnimalIntoSpecies(availableSpecies, animal));
        setValues(animal ? toAnimalFormValues(animal) : emptyAnimalFormValues);
        setCurrentStep(0);
        setFieldErrors({});
      } catch (error: unknown) {
        if (!isActive) return;

        const fallback = isEdit
          ? 'Não foi possível carregar os dados do animal.'
          : 'Não foi possível carregar as espécies.';
        setLoadError(getAnimalErrorMessage(error, fallback));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadFormData();
    return () => {
      isActive = false;
    };
  }, [animalUuid, isEdit, reloadKey]);

  const selectedSpecies = useMemo(
    () => species.find((item) => item.uuid === values.speciesUuid),
    [species, values.speciesUuid],
  );
  const isFeline = isFelineSpecies(selectedSpecies);
  const currentStepData = animalFormSteps[currentStep];
  const speciesOptions = useMemo(() => species.map((item) => ({ label: item.name, value: item.uuid })), [species]);
  const breedOptions = useMemo(
    () => (selectedSpecies?.breeds ?? []).map((breed) => ({ label: breed.name, value: breed.uuid })),
    [selectedSpecies],
  );

  const scrollToTop = () => scrollRef.current?.scrollTo({ animated: true, y: 0 });

  const changeField = <K extends keyof AnimalFormValues>(field: K, value: AnimalFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setApiError(null);
  };

  const changeSpecies = (speciesUuid: string) => {
    const nextSpecies = species.find((item) => item.uuid === speciesUuid);
    const nextIsFeline = isFelineSpecies(nextSpecies);

    setValues((current) => ({
      ...current,
      breedUuid: '',
      felv: nextIsFeline ? (isFeline ? current.felv : '') : 'não testado',
      fiv: nextIsFeline ? (isFeline ? current.fiv : '') : 'não testado',
      speciesUuid,
    }));
    setFieldErrors((current) => ({
      ...current,
      breedUuid: undefined,
      felv: undefined,
      fiv: undefined,
      speciesUuid: undefined,
    }));
    setApiError(null);
  };

  const validateCurrentStep = () => {
    const result = getAnimalFormSchema(isFeline).safeParse(values);
    const allErrors = result.success ? {} : getAnimalFormFieldErrors(result.error.issues);
    const stepErrors: AnimalFormFieldErrors = {};

    for (const field of currentStepData.fields) {
      if (allErrors[field]) stepErrors[field] = allErrors[field];
    }

    if (Object.keys(stepErrors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...stepErrors }));
      scrollToTop();
      return false;
    }

    setFieldErrors((current) => {
      const next = { ...current };
      for (const field of currentStepData.fields) next[field] = undefined;
      return next;
    });
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep((step) => Math.min(step + 1, animalFormSteps.length - 1));
    scrollToTop();
  };

  const handlePrevious = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
    setApiError(null);
    scrollToTop();
  };

  const handleSubmit = async () => {
    const result = getAnimalFormSchema(isFeline).safeParse(values);
    setApiError(null);

    if (!result.success) {
      const nextErrors = getAnimalFormFieldErrors(result.error.issues);
      const firstInvalidStep = animalFormSteps.findIndex((step) => step.fields.some((field) => nextErrors[field]));
      setFieldErrors(nextErrors);
      if (firstInvalidStep >= 0) setCurrentStep(firstInvalidStep);
      scrollToTop();
      return;
    }

    const data = result.data;
    if (!data.sex || !data.size || !data.castrated) return;

    const input: CreateAnimalInput = {
      birthDate: toApiBirthDate(data.birthDate),
      breedUuid: data.breedUuid,
      castrated: data.castrated === 'true',
      color: data.color.trim(),
      felv: data.felv || 'não testado',
      fiv: data.fiv || 'não testado',
      microchip: data.microchip.trim(),
      name: data.name.trim(),
      notes: data.notes.trim(),
      rga: data.rga.trim(),
      sex: data.sex,
      size: data.size,
      speciesUuid: data.speciesUuid,
    };

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      if (animalUuid) {
        await updateAnimal(animalUuid, { ...input, status: data.status });
        Alert.alert('Animal atualizado', 'As alterações foram salvas com sucesso.');
        router.back();
        return;
      }

      await createAnimal(input);
      Alert.alert('Animal cadastrado', 'O novo animal foi cadastrado com sucesso.');
      router.replace(routes.animals);
    } catch (error: unknown) {
      const fallback = isEdit
        ? 'Não foi possível atualizar o animal. Tente novamente.'
        : 'Não foi possível cadastrar o animal. Tente novamente.';
      setApiError(getAnimalErrorMessage(error, fallback));
      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScreenHeader
        description={isEdit ? 'Atualize as informações cadastradas' : 'Cadastre um novo animal'}
        title={isEdit ? 'Editar animal' : 'Novo animal'}
      />
      {isLoading ? <LoadingState isEdit={isEdit} /> : null}
      {!isLoading && loadError ? (
        <LoadError message={loadError} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : null}
      {!isLoading && !loadError ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 20 }}
          keyboardShouldPersistTaps='handled'
          ref={scrollRef}
        >
          <YStack gap='$4'>
            <ProgressIndicator currentStep={currentStep} />
            {apiError ? <FormApiError message={apiError} /> : null}
            <Text fontSize={12} style={{ color: colors.muted }}>
              Campos marcados com * são obrigatórios.
            </Text>
            <FormSection subtitle={currentStepData.subtitle} title={currentStepData.title}>
              <AnimalFormStepContent
                breedOptions={breedOptions}
                changeField={changeField}
                changeSpecies={changeSpecies}
                fieldErrors={fieldErrors}
                isEdit={isEdit}
                isFeline={isFeline}
                selectedSpecies={selectedSpecies}
                speciesOptions={speciesOptions}
                step={currentStep}
                values={values}
              />
            </FormSection>
            <AnimalFormActions
              currentStep={currentStep}
              isEdit={isEdit}
              isSubmitting={isSubmitting}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSubmit={() => void handleSubmit()}
            />
          </YStack>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function FormApiError({ message }: { message: string }) {
  const colors = useAppColors();

  return (
    <Card
      borderWidth={1}
      p='$3'
      rounded='$4'
      style={{ backgroundColor: `${colors.danger}14`, borderColor: colors.danger }}
    >
      <XStack gap='$2' items='flex-start'>
        <WarningCircleIcon color={colors.danger} size={21} weight='fill' />
        <Text flex={1} fontSize={14} lineHeight={20} style={{ color: colors.danger }}>
          {message}
        </Text>
      </XStack>
    </Card>
  );
}
