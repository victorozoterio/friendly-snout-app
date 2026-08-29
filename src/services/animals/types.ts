export type AnimalStageTotals = {
  quarantine: number;
  sheltered: number;
  adopted: number;
  lost: number;
};

export type AnimalSex = 'macho' | 'fêmea';

export type AnimalSize = 'pequeno' | 'médio' | 'grande';

export type AnimalFivFelv = 'sim' | 'não' | 'não testado';

export type AnimalStage = 'quarentena' | 'acolhido' | 'adotado' | 'perdido';

export type AnimalSpecies = {
  uuid: string;
  name: string;
};

export type AnimalBreed = {
  uuid: string;
  name: string;
};

export type AnimalSpeciesOption = AnimalSpecies & {
  breeds: AnimalBreed[];
};

export type Animal = {
  uuid: string;
  name: string;
  sex: AnimalSex;
  species: AnimalSpecies;
  breed: AnimalBreed;
  size: AnimalSize;
  color: string;
  birthDate: string | null;
  microchip: string | null;
  rga: string | null;
  castrated: boolean;
  fiv: AnimalFivFelv;
  felv: AnimalFivFelv;
  status: AnimalStage;
  notes: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedAnimalsMeta = {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
};

export type PaginatedAnimals = {
  data: Animal[];
  meta: PaginatedAnimalsMeta;
};

export type PaginatedAnimalSpecies = {
  data: AnimalSpeciesOption[];
  meta: PaginatedAnimalsMeta;
};

export type GetAnimalsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type AnimalMutationInput = {
  name: string;
  sex: AnimalSex;
  speciesUuid: string;
  breedUuid: string;
  size: AnimalSize;
  color: string;
  birthDate?: string;
  microchip: string;
  rga: string;
  castrated: boolean;
  fiv: AnimalFivFelv;
  felv: AnimalFivFelv;
  notes: string;
};

export type CreateAnimalInput = AnimalMutationInput;

export type UpdateAnimalInput = AnimalMutationInput & {
  status: AnimalStage;
};
