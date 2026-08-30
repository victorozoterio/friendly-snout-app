import { useRouter } from 'expo-router';
import { ArrowClockwise, ArrowLeft, ArrowRight, CheckCircle, FloppyDisk, WarningCircle } from 'phosphor-react-native';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, type KeyboardTypeOptions, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';

import {
  type Animal,
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
  toFormBirthDate,
  updateAnimal,
} from '../services/animals';
import { FormErrorInline } from './form-error-inline';
import { useAppColors } from './main-layout';
import { ScreenHeader } from './screen-header';

type AnimalFormScreenProps = {
  animalUuid?: string;
};

type Option<T extends string> = {
  label: string;
  value: T;
};

type FormStep = {
  fields: (keyof AnimalFormValues)[];
  shortTitle: string;
  subtitle: string;
  title: string;
};

const formSteps: FormStep[] = [
  {
    fields: ['name', 'speciesUuid', 'breedUuid', 'sex'],
    shortTitle: 'Básico',
    subtitle: 'Comece pelas informações principais do animal.',
    title: 'Dados básicos',
  },
  {
    fields: ['size', 'color', 'birthDate'],
    shortTitle: 'Perfil',
    subtitle: 'Informe as características usadas para identificar o animal.',
    title: 'Características',
  },
  {
    fields: ['castrated', 'fiv', 'felv'],
    shortTitle: 'Saúde',
    subtitle: 'Registre as informações de saúde conhecidas.',
    title: 'Saúde',
  },
  {
    fields: ['status', 'microchip', 'rga', 'notes'],
    shortTitle: 'Finalizar',
    subtitle: 'Complete os dados adicionais e revise antes de salvar.',
    title: 'Identificação e observações',
  },
];

const sexOptions: Option<Exclude<AnimalFormValues['sex'], ''>>[] = [
  { label: 'Macho', value: 'macho' },
  { label: 'Fêmea', value: 'fêmea' },
];

const sizeOptions: Option<Exclude<AnimalFormValues['size'], ''>>[] = [
  { label: 'Pequeno', value: 'pequeno' },
  { label: 'Médio', value: 'médio' },
  { label: 'Grande', value: 'grande' },
];

const testOptions: Option<Exclude<AnimalFormValues['fiv'], ''>>[] = [
  { label: 'Não testado', value: 'não testado' },
  { label: 'Negativo', value: 'não' },
  { label: 'Positivo', value: 'sim' },
];

const castrationOptions: Option<Exclude<AnimalFormValues['castrated'], ''>>[] = [
  { label: 'Não', value: 'false' },
  { label: 'Sim', value: 'true' },
];

const stageOptions: Option<AnimalFormValues['status']>[] = [
  { label: 'Quarentena', value: 'quarentena' },
  { label: 'Acolhido', value: 'acolhido' },
  { label: 'Adotado', value: 'adotado' },
  { label: 'Perdido', value: 'perdido' },
];

function isCat(species?: { name: string }) {
  return species?.name.trim().toLocaleLowerCase('pt-BR') === 'gato';
}

function mergeCurrentAnimalIntoSpecies(species: AnimalSpeciesOption[], animal: Animal | null) {
  if (!animal) return species;

  const speciesIndex = species.findIndex((item) => item.uuid === animal.species.uuid);
  if (speciesIndex < 0) return [...species, { ...animal.species, breeds: [animal.breed] }];

  if (species[speciesIndex].breeds.some((breed) => breed.uuid === animal.breed.uuid)) return species;

  return species.map((item, index) =>
    index === speciesIndex ? { ...item, breeds: [...item.breeds, animal.breed] } : item,
  );
}

function getValuesFromAnimal(animal: Animal): AnimalFormValues {
  return {
    name: animal.name,
    sex: animal.sex,
    speciesUuid: animal.species.uuid,
    breedUuid: animal.breed.uuid,
    size: animal.size,
    color: animal.color,
    birthDate: toFormBirthDate(animal.birthDate),
    microchip: animal.microchip ?? '',
    rga: animal.rga ?? '',
    castrated: animal.castrated ? 'true' : 'false',
    fiv: animal.fiv,
    felv: animal.felv,
    status: animal.status,
    notes: animal.notes ?? '',
  };
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function getFieldErrors(issues: { message: string; path: PropertyKey[] }[]) {
  const errors: AnimalFormFieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !(field in errors)) {
      errors[field as keyof AnimalFormValues] = issue.message;
    }
  }

  return errors;
}

function FieldLabel({ children, required = false }: { children: string; required?: boolean }) {
  const colors = useAppColors();

  return (
    <Text fontSize={14} fontWeight='700' style={{ color: colors.text }}>
      {children}
      {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
    </Text>
  );
}

type InputFieldProps = {
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  label: string;
  maxLength?: number;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
};

function InputField({
  error,
  keyboardType,
  label,
  maxLength,
  multiline = false,
  onChangeText,
  placeholder,
  required = false,
  value,
}: InputFieldProps) {
  const colors = useAppColors();

  return (
    <YStack gap='$1'>
      <FieldLabel required={required}>{label}</FieldLabel>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={{
          backgroundColor: colors.card,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: 12,
          borderWidth: 1,
          color: colors.text,
          fontSize: 15,
          minHeight: multiline ? 112 : 48,
          paddingHorizontal: 14,
          paddingVertical: 12,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        value={value}
      />
      <FormErrorInline message={error} />
    </YStack>
  );
}

type ChoiceFieldProps<T extends string> = {
  error?: string;
  label: string;
  onChange: (value: T) => void;
  options: Option<T>[];
  required?: boolean;
  value: T | '';
};

function ChoiceField<T extends string>({
  error,
  label,
  onChange,
  options,
  required = false,
  value,
}: ChoiceFieldProps<T>) {
  const colors = useAppColors();

  return (
    <YStack gap='$2'>
      <FieldLabel required={required}>{label}</FieldLabel>
      <XStack flexWrap='wrap' gap='$2'>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              accessibilityLabel={`${label}: ${option.label}`}
              accessibilityRole='radio'
              accessibilityState={{ selected: isSelected }}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => ({
                backgroundColor: isSelected ? `${colors.primary}22` : colors.card,
                borderColor: isSelected ? colors.primary : error ? colors.danger : colors.border,
                borderRadius: 12,
                borderWidth: 1,
                opacity: pressed ? 0.72 : 1,
                paddingHorizontal: 14,
                paddingVertical: 11,
              })}
            >
              <Text
                fontSize={14}
                fontWeight={isSelected ? '700' : '500'}
                style={{ color: isSelected ? colors.primary : colors.text }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </XStack>
      <FormErrorInline message={error} />
    </YStack>
  );
}

function FormSection({ children, subtitle, title }: { children: ReactNode; subtitle: string; title: string }) {
  const colors = useAppColors();

  return (
    <YStack gap='$3'>
      <YStack gap='$1'>
        <Text fontSize={20} fontWeight='800' style={{ color: colors.text }}>
          {title}
        </Text>
        <Text fontSize={14} lineHeight={20} style={{ color: colors.muted }}>
          {subtitle}
        </Text>
      </YStack>
      <Card
        borderWidth={1}
        gap='$2'
        p='$4'
        rounded='$4'
        style={{ backgroundColor: colors.cardMuted, borderColor: colors.border }}
      >
        {children}
      </Card>
    </YStack>
  );
}

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  const colors = useAppColors();

  return (
    <YStack gap='$2'>
      <XStack gap='$2'>
        {formSteps.map((step, index) => (
          <YStack flex={1} gap='$2' key={step.title}>
            <YStack
              height={6}
              rounded='$2'
              style={{ backgroundColor: index <= currentStep ? colors.primary : colors.border }}
            />
            <Text
              fontSize={11}
              fontWeight={index === currentStep ? '700' : '500'}
              numberOfLines={1}
              style={{ color: index === currentStep ? colors.primary : colors.muted, textAlign: 'center' }}
            >
              {step.shortTitle}
            </Text>
          </YStack>
        ))}
      </XStack>
      <Text fontSize={12} style={{ color: colors.muted, textAlign: 'right' }}>
        Etapa {currentStep + 1} de {formSteps.length}
      </Text>
    </YStack>
  );
}

function LoadingState({ isEdit }: { isEdit: boolean }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6'>
      <ActivityIndicator color={colors.primary} size='large' />
      <Text style={{ color: colors.muted }}>{isEdit ? 'Carregando dados do animal...' : 'Carregando espécies...'}</Text>
    </YStack>
  );
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6'>
      <WarningCircle color={colors.warning} size={42} weight='fill' />
      <Text fontSize={17} fontWeight='700' style={{ color: colors.text, textAlign: 'center' }}>
        {message}
      </Text>
      <Pressable
        accessibilityLabel='Tentar carregar o formulário novamente'
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
          <ArrowClockwise color='#FFFFFF' size={18} />
          <Text fontWeight='700' style={{ color: '#FFFFFF' }}>
            Tentar novamente
          </Text>
        </XStack>
      </Pressable>
    </YStack>
  );
}

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
    setIsLoading(true);
    setLoadError(null);

    const loadData = async () => {
      try {
        const [availableSpecies, animal] = await Promise.all([
          getAnimalSpecies(),
          animalUuid ? getAnimal(animalUuid) : Promise.resolve(null),
        ]);
        if (!isActive) return;
        if (availableSpecies.length === 0) throw new Error('No species available');

        setSpecies(mergeCurrentAnimalIntoSpecies(availableSpecies, animal));
        setValues(animal ? getValuesFromAnimal(animal) : emptyAnimalFormValues);
        setCurrentStep(0);
        setFieldErrors({});
      } catch (error: unknown) {
        if (!isActive) return;
        setLoadError(
          getAnimalErrorMessage(
            error,
            isEdit ? 'Não foi possível carregar os dados do animal.' : 'Não foi possível carregar as espécies.',
          ),
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadData();
    return () => {
      isActive = false;
    };
  }, [animalUuid, isEdit, reloadKey]);

  const selectedSpecies = useMemo(
    () => species.find((item) => item.uuid === values.speciesUuid),
    [species, values.speciesUuid],
  );
  const isFeline = isCat(selectedSpecies);
  const currentStepData = formSteps[currentStep];

  const breedOptions = useMemo(() => {
    return (selectedSpecies?.breeds ?? []).map((breed) => ({ label: breed.name, value: breed.uuid }));
  }, [selectedSpecies]);

  const changeField = <K extends keyof AnimalFormValues>(field: K, value: AnimalFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setApiError(null);
  };

  const changeSpecies = (speciesUuid: string) => {
    const nextSpecies = species.find((item) => item.uuid === speciesUuid);
    const nextIsFeline = isCat(nextSpecies);

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
    const allErrors = result.success ? {} : getFieldErrors(result.error.issues);
    const stepErrors: AnimalFormFieldErrors = {};

    for (const field of currentStepData.fields) {
      if (allErrors[field]) stepErrors[field] = allErrors[field];
    }

    if (Object.keys(stepErrors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...stepErrors }));
      scrollRef.current?.scrollTo({ animated: true, y: 0 });
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
    setCurrentStep((step) => Math.min(step + 1, formSteps.length - 1));
    scrollRef.current?.scrollTo({ animated: true, y: 0 });
  };

  const handlePrevious = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
    setApiError(null);
    scrollRef.current?.scrollTo({ animated: true, y: 0 });
  };

  const handleSubmit = async () => {
    const result = getAnimalFormSchema(isFeline).safeParse(values);
    setApiError(null);

    if (!result.success) {
      const nextErrors = getFieldErrors(result.error.issues);
      const firstInvalidStep = formSteps.findIndex((step) => step.fields.some((field) => nextErrors[field]));
      setFieldErrors(nextErrors);
      if (firstInvalidStep >= 0) setCurrentStep(firstInvalidStep);
      scrollRef.current?.scrollTo({ animated: true, y: 0 });
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
      } else {
        await createAnimal(input);
        Alert.alert('Animal cadastrado', 'O novo animal foi cadastrado com sucesso.');
        router.replace('/animals' as never);
      }
    } catch (error: unknown) {
      setApiError(
        getAnimalErrorMessage(
          error,
          isEdit
            ? 'Não foi possível atualizar o animal. Tente novamente.'
            : 'Não foi possível cadastrar o animal. Tente novamente.',
        ),
      );
      scrollRef.current?.scrollTo({ animated: true, y: 0 });
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

            {apiError ? (
              <Card
                borderWidth={1}
                p='$3'
                rounded='$4'
                style={{ backgroundColor: `${colors.danger}14`, borderColor: colors.danger }}
              >
                <XStack gap='$2' items='flex-start'>
                  <WarningCircle color={colors.danger} size={21} weight='fill' />
                  <Text flex={1} fontSize={14} lineHeight={20} style={{ color: colors.danger }}>
                    {apiError}
                  </Text>
                </XStack>
              </Card>
            ) : null}

            <Text fontSize={12} style={{ color: colors.muted }}>
              Campos marcados com * são obrigatórios.
            </Text>

            <FormSection subtitle={currentStepData.subtitle} title={currentStepData.title}>
              {currentStep === 0 ? (
                <>
                  <InputField
                    error={fieldErrors.name}
                    label='Nome'
                    maxLength={100}
                    onChangeText={(value) => changeField('name', value)}
                    placeholder='Ex.: Luna'
                    required
                    value={values.name}
                  />

                  <ChoiceField
                    error={fieldErrors.speciesUuid}
                    label='Espécie'
                    onChange={changeSpecies}
                    options={species.map((item) => ({ label: item.name, value: item.uuid }))}
                    required
                    value={values.speciesUuid}
                  />

                  {selectedSpecies ? (
                    breedOptions.length > 0 ? (
                      <ChoiceField
                        error={fieldErrors.breedUuid}
                        label='Raça'
                        onChange={(value) => changeField('breedUuid', value)}
                        options={breedOptions}
                        required
                        value={values.breedUuid}
                      />
                    ) : (
                      <YStack gap='$1'>
                        <FieldLabel required>Raça</FieldLabel>
                        <Card
                          borderWidth={1}
                          p='$3'
                          rounded='$3'
                          style={{ backgroundColor: `${colors.warning}14`, borderColor: colors.warning }}
                        >
                          <Text fontSize={13} lineHeight={19} style={{ color: colors.text }}>
                            Esta espécie ainda não possui raças disponíveis para cadastro.
                          </Text>
                        </Card>
                        <FormErrorInline message={fieldErrors.breedUuid} />
                      </YStack>
                    )
                  ) : null}

                  <ChoiceField
                    error={fieldErrors.sex}
                    label='Sexo'
                    onChange={(value) => changeField('sex', value)}
                    options={sexOptions}
                    required
                    value={values.sex}
                  />
                </>
              ) : null}

              {currentStep === 1 ? (
                <>
                  <ChoiceField
                    error={fieldErrors.size}
                    label='Porte'
                    onChange={(value) => changeField('size', value)}
                    options={sizeOptions}
                    required
                    value={values.size}
                  />
                  <InputField
                    error={fieldErrors.color}
                    label='Cor'
                    maxLength={100}
                    onChangeText={(value) => changeField('color', value)}
                    placeholder='Ex.: Caramelo e branco'
                    required
                    value={values.color}
                  />
                  <InputField
                    error={fieldErrors.birthDate}
                    keyboardType='numeric'
                    label='Data de nascimento'
                    maxLength={10}
                    onChangeText={(value) => changeField('birthDate', formatDateInput(value))}
                    placeholder='DD/MM/AAAA'
                    value={values.birthDate}
                  />
                </>
              ) : null}

              {currentStep === 2 ? (
                <>
                  <ChoiceField
                    error={fieldErrors.castrated}
                    label='Castrado'
                    onChange={(value) => changeField('castrated', value)}
                    options={castrationOptions}
                    required
                    value={values.castrated}
                  />

                  {isFeline ? (
                    <>
                      <Card
                        borderWidth={1}
                        p='$3'
                        rounded='$3'
                        style={{ backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}55` }}
                      >
                        <Text fontSize={13} lineHeight={19} style={{ color: colors.text }}>
                          Como a espécie selecionada é Gato, informe a situação dos testes de FIV e FELV.
                        </Text>
                      </Card>
                      <ChoiceField
                        error={fieldErrors.fiv}
                        label='FIV'
                        onChange={(value) => changeField('fiv', value)}
                        options={testOptions}
                        required
                        value={values.fiv}
                      />
                      <ChoiceField
                        error={fieldErrors.felv}
                        label='FELV'
                        onChange={(value) => changeField('felv', value)}
                        options={testOptions}
                        required
                        value={values.felv}
                      />
                    </>
                  ) : (
                    <Text fontSize={13} lineHeight={19} style={{ color: colors.muted }}>
                      Os campos de FIV e FELV são exibidos somente para gatos.
                    </Text>
                  )}
                </>
              ) : null}

              {currentStep === 3 ? (
                <>
                  {isEdit ? (
                    <ChoiceField
                      error={fieldErrors.status}
                      label='Estágio'
                      onChange={(value) => changeField('status', value)}
                      options={stageOptions}
                      required
                      value={values.status}
                    />
                  ) : null}
                  <InputField
                    error={fieldErrors.microchip}
                    label='Microchip'
                    maxLength={100}
                    onChangeText={(value) => changeField('microchip', value)}
                    placeholder='Número do microchip'
                    value={values.microchip}
                  />
                  <InputField
                    error={fieldErrors.rga}
                    label='RGA'
                    maxLength={100}
                    onChangeText={(value) => changeField('rga', value)}
                    placeholder='Registro Geral do Animal'
                    value={values.rga}
                  />
                  <InputField
                    error={fieldErrors.notes}
                    label='Observações'
                    maxLength={1000}
                    multiline
                    onChangeText={(value) => changeField('notes', value)}
                    placeholder='Informações adicionais sobre o animal'
                    value={values.notes}
                  />
                </>
              ) : null}
            </FormSection>

            <XStack gap='$3'>
              {currentStep > 0 ? (
                <Pressable
                  accessibilityLabel='Voltar para a etapa anterior'
                  disabled={isSubmitting}
                  onPress={handlePrevious}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: 14,
                    borderWidth: 1,
                    flex: 1,
                    justifyContent: 'center',
                    opacity: isSubmitting ? 0.55 : pressed ? 0.72 : 1,
                    paddingHorizontal: 14,
                    paddingVertical: 15,
                  })}
                >
                  <XStack gap='$2' items='center'>
                    <ArrowLeft color={colors.text} size={20} weight='bold' />
                    <Text fontSize={15} fontWeight='700' style={{ color: colors.text }}>
                      Voltar
                    </Text>
                  </XStack>
                </Pressable>
              ) : null}

              <Pressable
                accessibilityLabel={
                  currentStep === formSteps.length - 1
                    ? isEdit
                      ? 'Salvar alterações do animal'
                      : 'Cadastrar animal'
                    : 'Continuar para a próxima etapa'
                }
                disabled={isSubmitting}
                onPress={() => {
                  if (currentStep === formSteps.length - 1) void handleSubmit();
                  else handleNext();
                }}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  borderRadius: 14,
                  flex: currentStep > 0 ? 1.45 : 1,
                  justifyContent: 'center',
                  opacity: isSubmitting ? 0.55 : pressed ? 0.78 : 1,
                  paddingHorizontal: 14,
                  paddingVertical: 15,
                })}
              >
                <XStack gap='$2' items='center' justify='center'>
                  {isSubmitting ? (
                    <ActivityIndicator color='#FFFFFF' />
                  ) : currentStep < formSteps.length - 1 ? (
                    <ArrowRight color='#FFFFFF' size={20} weight='bold' />
                  ) : isEdit ? (
                    <FloppyDisk color='#FFFFFF' size={21} weight='bold' />
                  ) : (
                    <CheckCircle color='#FFFFFF' size={21} weight='bold' />
                  )}
                  <Text fontSize={15} fontWeight='800' style={{ color: '#FFFFFF' }}>
                    {isSubmitting
                      ? 'Salvando...'
                      : currentStep < formSteps.length - 1
                        ? 'Continuar'
                        : isEdit
                          ? 'Salvar alterações'
                          : 'Cadastrar animal'}
                  </Text>
                </XStack>
              </Pressable>
            </XStack>
          </YStack>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
