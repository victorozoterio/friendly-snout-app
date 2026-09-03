import { api } from '../api';
import type {
  CreateMedicineApplicationInput,
  GetMedicineApplicationsParams,
  MedicineApplication,
  PaginatedMedicineApplications,
} from './types';

type MedicineApplicationsResponse = PaginatedMedicineApplications | MedicineApplication[];

export async function getMedicineApplicationsByAnimal(
  animalUuid: string,
  { page = 1, limit = 100 }: GetMedicineApplicationsParams = {},
): Promise<PaginatedMedicineApplications> {
  const { data } = await api.get<MedicineApplicationsResponse>(`/medicine-applications/by-animal/${animalUuid}`, {
    params: { page, limit },
  });

  if (Array.isArray(data)) {
    return {
      data,
      meta: { currentPage: 1, itemsPerPage: data.length, totalItems: data.length, totalPages: 1 },
    };
  }

  return data;
}

export async function createMedicineApplication(
  animalUuid: string,
  input: CreateMedicineApplicationInput,
): Promise<MedicineApplication> {
  const { data } = await api.post<MedicineApplication>(`/medicine-applications/animal/${animalUuid}`, input);
  return data;
}

export async function deleteMedicineApplication(applicationUuid: string): Promise<void> {
  await api.delete(`/medicine-applications/${applicationUuid}`);
}
