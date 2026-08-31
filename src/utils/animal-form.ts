import type { Animal, AnimalFormFieldErrors, AnimalFormValues, AnimalSpeciesOption } from '../services/animals';
import { toFormBirthDate } from '../services/animals';

/**
 * Identifica se uma espécie representa gatos, independente de caixa ou espaços extras.
 */
export function isFelineSpecies(species?: { name: string }): boolean {
  return species?.name.trim().toLocaleLowerCase('pt-BR') === 'gato';
}

/**
 * Mantém no seletor a espécie e a raça do animal em edição quando elas não vierem na lista disponível.
 */
export function mergeAnimalIntoSpecies(species: AnimalSpeciesOption[], animal: Animal | null): AnimalSpeciesOption[] {
  if (!animal) return species;

  const speciesIndex = species.findIndex((item) => item.uuid === animal.species.uuid);
  if (speciesIndex < 0) return [...species, { ...animal.species, breeds: [animal.breed] }];

  if (species[speciesIndex].breeds.some((breed) => breed.uuid === animal.breed.uuid)) return species;

  return species.map((item, index) =>
    index === speciesIndex ? { ...item, breeds: [...item.breeds, animal.breed] } : item,
  );
}

/**
 * Converte o animal retornado pela API nos valores controlados pelo formulário.
 */
export function toAnimalFormValues(animal: Animal): AnimalFormValues {
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

/**
 * Aplica a máscara DD/MM/AAAA sem permitir mais de oito algarismos.
 */
export function formatBirthDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Agrupa os erros do Zod pelo primeiro campo, preservando a primeira mensagem de cada um.
 */
export function getAnimalFormFieldErrors(issues: { message: string; path: PropertyKey[] }[]): AnimalFormFieldErrors {
  const errors: AnimalFormFieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !(field in errors)) {
      errors[field as keyof AnimalFormValues] = issue.message;
    }
  }

  return errors;
}

export type PrimaryFormAction = {
  accessibilityLabel: string;
  icon: 'continue' | 'create' | 'save' | 'loading';
  label: string;
};

/**
 * Centraliza o texto, ícone e rótulo acessível da ação principal do formulário.
 */
export function getPrimaryFormAction({
  isEdit,
  isFinalStep,
  isSubmitting,
}: {
  isEdit: boolean;
  isFinalStep: boolean;
  isSubmitting: boolean;
}): PrimaryFormAction {
  if (isSubmitting) {
    return { accessibilityLabel: 'Salvando dados do animal', icon: 'loading', label: 'Salvando...' };
  }

  if (!isFinalStep) {
    return { accessibilityLabel: 'Continuar para a próxima etapa', icon: 'continue', label: 'Continuar' };
  }

  if (isEdit) {
    return { accessibilityLabel: 'Salvar alterações do animal', icon: 'save', label: 'Salvar alterações' };
  }

  return { accessibilityLabel: 'Cadastrar animal', icon: 'create', label: 'Cadastrar animal' };
}
