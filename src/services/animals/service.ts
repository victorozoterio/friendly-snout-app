import { api } from '../api';
import type {
  Animal,
  AnimalMutationInput,
  AnimalStageTotals,
  CreateAnimalInput,
  GetAnimalsParams,
  PaginatedAnimalSpecies,
  PaginatedAnimals,
  UpdateAnimalInput,
} from './types';

function toAnimalFormData(input: AnimalMutationInput, status?: UpdateAnimalInput['status']) {
  const formData = new FormData();

  formData.append('name', input.name);
  formData.append('sex', input.sex);
  formData.append('speciesUuid', input.speciesUuid);
  formData.append('breedUuid', input.breedUuid);
  formData.append('size', input.size);
  formData.append('color', input.color);
  if (input.birthDate) formData.append('birthDate', input.birthDate);
  formData.append('microchip', input.microchip);
  formData.append('rga', input.rga);
  formData.append('castrated', String(input.castrated));
  formData.append('fiv', input.fiv);
  formData.append('felv', input.felv);
  formData.append('notes', input.notes);
  if (status) formData.append('status', status);

  return formData;
}

export async function getAnimalStageTotals(): Promise<AnimalStageTotals> {
  const { data } = await api.get<AnimalStageTotals>('/animals/total-per-stage');
  return data;
}

export async function getAnimals({ page = 1, limit = 50, search }: GetAnimalsParams = {}): Promise<PaginatedAnimals> {
  const { data } = await api.get<PaginatedAnimals>('/animals', {
    params: { page, limit, ...(search ? { search } : {}) },
  });
  return data;
}

export async function getAnimal(uuid: string): Promise<Animal> {
  const { data } = await api.get<Animal>(`/animals/${uuid}`);
  return data;
}

export async function getAnimalSpecies() {
  const { data } = await api.get<PaginatedAnimalSpecies>('/species', { params: { limit: 100 } });
  return data.data;
}

export async function createAnimal(input: CreateAnimalInput): Promise<Animal> {
  const { data } = await api.post<Animal>('/animals', toAnimalFormData(input));
  return data;
}

export async function updateAnimal(uuid: string, input: UpdateAnimalInput): Promise<Animal> {
  const { data } = await api.patch<Animal>(`/animals/${uuid}`, toAnimalFormData(input, input.status));
  return data;
}

export async function deleteAnimal(uuid: string): Promise<void> {
  await api.delete(`/animals/${uuid}`);
}
