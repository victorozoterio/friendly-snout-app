import type { Medicine } from '../medicines';

export type MedicineApplicationFrequency =
  | 'não se repete'
  | 'todos os dias da semana'
  | 'diário'
  | 'semanal'
  | 'mensal'
  | 'anual';

export type MedicineApplicationStatus = 'em atraso' | 'aplicado' | 'em dia';

export type MedicineApplication = {
  uuid: string;
  quantity: number;
  appliedAt: string;
  nextApplicationAt: string | null;
  frequency: MedicineApplicationFrequency | null;
  status: MedicineApplicationStatus;
  googleCalendarEventId: string | null;
  createdAt: string;
  medicine: Pick<Medicine, 'uuid' | 'name'> & Partial<Medicine>;
  animal?: { uuid: string; name?: string };
};

export type MedicineApplicationsMeta = {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
};

export type PaginatedMedicineApplications = {
  data: MedicineApplication[];
  meta: MedicineApplicationsMeta;
};

export type GetMedicineApplicationsParams = {
  page?: number;
  limit?: number;
};

export type CreateMedicineApplicationInput = {
  medicineUuid: string;
  quantity: number;
  appliedAt: string;
  nextApplicationAt?: string;
  frequency?: MedicineApplicationFrequency;
};
