import { api } from '../api';
import type { AnimalStageTotals } from './types';

export async function getAnimalStageTotals(): Promise<AnimalStageTotals> {
  const { data } = await api.get<AnimalStageTotals>('/animals/total-per-stage');
  return data;
}
