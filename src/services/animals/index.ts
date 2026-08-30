export { getAnimalErrorMessage } from './errors';
export {
  getAnimalPhotos,
  getAnimalProfilePhoto,
  removeAnimalPhoto,
  saveAnimalPhoto,
  setAnimalProfilePhoto,
} from './photo-storage';
export type { AnimalFormFieldErrors, AnimalFormValues } from './schema';
export {
  emptyAnimalFormValues,
  getAnimalFormSchema,
  toApiBirthDate,
  toFormBirthDate,
} from './schema';
export {
  createAnimal,
  deleteAnimal,
  getAnimal,
  getAnimalSpecies,
  getAnimalStageTotals,
  getAnimals,
  updateAnimal,
} from './service';
export type {
  Animal,
  AnimalBreed,
  AnimalFivFelv,
  AnimalMutationInput,
  AnimalSex,
  AnimalSize,
  AnimalSpecies,
  AnimalSpeciesOption,
  AnimalStage,
  AnimalStageTotals,
  CreateAnimalInput,
  GetAnimalsParams,
  PaginatedAnimalSpecies,
  PaginatedAnimals,
  PaginatedAnimalsMeta,
  UpdateAnimalInput,
} from './types';
