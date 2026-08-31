/** Rotas estáticas expostas pelo Expo Router. */
export const routes = {
  animalForm: '/animal-form',
  animals: '/animals',
  home: '/',
  login: '/login',
  medicines: '/medicines',
} as const;

/** Cria as rotas que dependem do identificador de um animal. */
export const animalRoutes = {
  attachments: (animalUuid: string) => `/animal-attachments/${animalUuid}` as const,
  details: (animalUuid: string) => `/animal-details/${animalUuid}` as const,
  edit: (animalUuid: string) => `/edit-animal/${animalUuid}` as const,
  medicines: (animalUuid: string) => `/animal-medicines/${animalUuid}` as const,
};

/** Nomes de tela usados exclusivamente na declaração do Stack. */
export const routeNames = {
  animalAttachments: 'animal-attachments/[animalUuid]',
  animalDetails: 'animal-details/[animalUuid]',
  animalForm: 'animal-form',
  animalMedicines: 'animal-medicines/[animalUuid]',
  animals: 'animals',
  editAnimal: 'edit-animal/[animalUuid]',
  home: 'index',
  login: 'login',
  medicines: 'medicines',
} as const;
