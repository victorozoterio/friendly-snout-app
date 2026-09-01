import type { AnimalFormValues } from '../../services/animals';
import { colors } from '../../theme';
import type { FormOption } from '../form/fields';

export type { FormOption };

export type FormStep = {
  fields: (keyof AnimalFormValues)[];
  shortTitle: string;
  subtitle: string;
  title: string;
};

export const animalFormSteps: FormStep[] = [
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

export const sexOptions: FormOption<Exclude<AnimalFormValues['sex'], ''>>[] = [
  { label: 'Macho', value: 'macho' },
  { label: 'Fêmea', value: 'fêmea' },
];

export const sizeOptions: FormOption<Exclude<AnimalFormValues['size'], ''>>[] = [
  { label: 'Pequeno', value: 'pequeno' },
  { label: 'Médio', value: 'médio' },
  { label: 'Grande', value: 'grande' },
];

export const testOptions: FormOption<Exclude<AnimalFormValues['fiv'], ''>>[] = [
  { label: 'Não testado', value: 'não testado' },
  { label: 'Negativo', value: 'não' },
  { label: 'Positivo', value: 'sim' },
];

export const castrationOptions: FormOption<Exclude<AnimalFormValues['castrated'], ''>>[] = [
  { label: 'Não', value: 'false' },
  { label: 'Sim', value: 'true' },
];

export const stageOptions: FormOption<AnimalFormValues['status']>[] = [
  { label: 'Quarentena', value: 'quarentena' },
  { label: 'Acolhido', value: 'acolhido' },
  { label: 'Adotado', value: 'adotado' },
  { label: 'Perdido', value: 'perdido' },
];

export const onPrimaryColor = colors.white;
