export type MedicineBrand = {
  uuid: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Medicine = {
  uuid: string;
  name: string;
  description: string | null;
  quantity: number;
  isActive: boolean;
  medicineBrand?: MedicineBrand;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedMeta = {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
};

export type PaginatedMedicines = {
  data: Medicine[];
  meta: PaginatedMeta;
};

export type PaginatedMedicineBrands = {
  data: MedicineBrand[];
  meta: PaginatedMeta;
};

export type GetMedicinesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type GetMedicineBrandsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type MedicineMutationInput = {
  name: string;
  description?: string;
  quantity: number;
  medicineBrandUuid: string;
};

export type MedicineBrandMutationInput = {
  name: string;
};
