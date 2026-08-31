import { Card, Text, YStack } from 'tamagui';

import type { AnimalFormFieldErrors, AnimalFormValues, AnimalSpeciesOption } from '../../services/animals';
import { formatBirthDateInput } from '../../utils/animal-form';
import { FormErrorInline } from '../form-error-inline';
import { useAppColors } from '../main-layout';
import { castrationOptions, type FormOption, sexOptions, sizeOptions, stageOptions, testOptions } from './constants';
import { ChoiceField, FieldLabel, InputField } from './fields';

type ChangeField = <K extends keyof AnimalFormValues>(field: K, value: AnimalFormValues[K]) => void;

type AnimalFormStepContentProps = {
  breedOptions: FormOption<string>[];
  changeField: ChangeField;
  changeSpecies: (speciesUuid: string) => void;
  fieldErrors: AnimalFormFieldErrors;
  isEdit: boolean;
  isFeline: boolean;
  selectedSpecies?: AnimalSpeciesOption;
  speciesOptions: FormOption<string>[];
  step: number;
  values: AnimalFormValues;
};

export function AnimalFormStepContent({
  breedOptions,
  changeField,
  changeSpecies,
  fieldErrors,
  isEdit,
  isFeline,
  selectedSpecies,
  speciesOptions,
  step,
  values,
}: AnimalFormStepContentProps) {
  switch (step) {
    case 0:
      return (
        <BasicStep
          breedOptions={breedOptions}
          changeField={changeField}
          changeSpecies={changeSpecies}
          fieldErrors={fieldErrors}
          selectedSpecies={selectedSpecies}
          speciesOptions={speciesOptions}
          values={values}
        />
      );
    case 1:
      return <CharacteristicsStep changeField={changeField} fieldErrors={fieldErrors} values={values} />;
    case 2:
      return <HealthStep changeField={changeField} fieldErrors={fieldErrors} isFeline={isFeline} values={values} />;
    case 3:
      return <FinalStep changeField={changeField} fieldErrors={fieldErrors} isEdit={isEdit} values={values} />;
    default:
      return null;
  }
}

type BasicStepProps = Pick<
  AnimalFormStepContentProps,
  'breedOptions' | 'changeField' | 'changeSpecies' | 'fieldErrors' | 'selectedSpecies' | 'speciesOptions' | 'values'
>;

function BasicStep({
  breedOptions,
  changeField,
  changeSpecies,
  fieldErrors,
  selectedSpecies,
  speciesOptions,
  values,
}: BasicStepProps) {
  return (
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
        options={speciesOptions}
        required
        value={values.speciesUuid}
      />
      <BreedField
        breedOptions={breedOptions}
        changeField={changeField}
        error={fieldErrors.breedUuid}
        selectedSpecies={selectedSpecies}
        value={values.breedUuid}
      />
      <ChoiceField
        error={fieldErrors.sex}
        label='Sexo'
        onChange={(value) => changeField('sex', value)}
        options={sexOptions}
        required
        value={values.sex}
      />
    </>
  );
}

type BreedFieldProps = {
  breedOptions: FormOption<string>[];
  changeField: ChangeField;
  error?: string;
  selectedSpecies?: AnimalSpeciesOption;
  value: string;
};

function BreedField({ breedOptions, changeField, error, selectedSpecies, value }: BreedFieldProps) {
  const colors = useAppColors();

  if (!selectedSpecies) return null;
  if (breedOptions.length > 0) {
    return (
      <ChoiceField
        error={error}
        label='Raça'
        onChange={(nextValue) => changeField('breedUuid', nextValue)}
        options={breedOptions}
        required
        value={value}
      />
    );
  }

  return (
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
      <FormErrorInline message={error} />
    </YStack>
  );
}

type StepProps = Pick<AnimalFormStepContentProps, 'changeField' | 'fieldErrors' | 'values'>;

function CharacteristicsStep({ changeField, fieldErrors, values }: StepProps) {
  return (
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
        onChangeText={(value) => changeField('birthDate', formatBirthDateInput(value))}
        placeholder='DD/MM/AAAA'
        value={values.birthDate}
      />
    </>
  );
}

function HealthStep({ changeField, fieldErrors, isFeline, values }: StepProps & { isFeline: boolean }) {
  const colors = useAppColors();

  return (
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
  );
}

function FinalStep({ changeField, fieldErrors, isEdit, values }: StepProps & { isEdit: boolean }) {
  return (
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
  );
}
