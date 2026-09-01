import { api } from '../api';
import type {
  GetMedicineBrandsParams,
  GetMedicinesParams,
  Medicine,
  MedicineBrand,
  MedicineBrandMutationInput,
  MedicineMutationInput,
  PaginatedMedicineBrands,
  PaginatedMedicines,
} from './types';

export async function getMedicines({
  page = 1,
  limit = 50,
  search,
}: GetMedicinesParams = {}): Promise<PaginatedMedicines> {
  const { data } = await api.get<PaginatedMedicines>('/medicines', {
    params: { page, limit, ...(search ? { search } : {}) },
  });
  return data;
}

export async function getMedicine(uuid: string): Promise<Medicine> {
  const { data } = await api.get<Medicine>(`/medicines/${uuid}`);
  return data;
}

export async function createMedicine(input: MedicineMutationInput): Promise<Medicine> {
  const { data } = await api.post<Medicine>('/medicines', input);
  return data;
}

export async function updateMedicine(uuid: string, input: MedicineMutationInput): Promise<Medicine> {
  const { data } = await api.patch<Medicine>(`/medicines/${uuid}`, input);
  return data;
}

export async function getMedicineBrands({
  page = 1,
  limit = 100,
  search,
}: GetMedicineBrandsParams = {}): Promise<PaginatedMedicineBrands> {
  const { data } = await api.get<PaginatedMedicineBrands>('/medicine-brands', {
    params: { page, limit, ...(search ? { search } : {}) },
  });
  return data;
}

export async function createMedicineBrand(input: MedicineBrandMutationInput): Promise<MedicineBrand> {
  const { data } = await api.post<MedicineBrand>('/medicine-brands', input);
  return data;
}

export async function updateMedicineBrand(uuid: string, input: MedicineBrandMutationInput): Promise<MedicineBrand> {
  const { data } = await api.patch<MedicineBrand>(`/medicine-brands/${uuid}`, input);
  return data;
}
