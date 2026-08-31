import type { AnimalFivFelv, AnimalSex, AnimalSize, AnimalStage } from './types';

export type AnimalFormValues = {
  birthDate: string;
  breedUuid: string;
  castrated: 'true' | 'false' | '';
  color: string;
  felv: AnimalFivFelv | '';
  fiv: AnimalFivFelv | '';
  microchip: string;
  name: string;
  notes: string;
  rga: string;
  sex: AnimalSex | '';
  size: AnimalSize | '';
  speciesUuid: string;
  status: AnimalStage;
};

export type AnimalFormFieldErrors = Partial<Record<keyof AnimalFormValues, string>>;

export const emptyAnimalFormValues: AnimalFormValues = {
  birthDate: '',
  breedUuid: '',
  castrated: '',
  color: '',
  felv: '',
  fiv: '',
  microchip: '',
  name: '',
  notes: '',
  rga: '',
  sex: '',
  size: '',
  speciesUuid: '',
  status: 'quarentena',
};
