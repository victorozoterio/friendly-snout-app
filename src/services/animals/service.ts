import { api } from '../api';
import type { Animal, AnimalStageTotals, GetAnimalsParams, PaginatedAnimals } from './types';

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
