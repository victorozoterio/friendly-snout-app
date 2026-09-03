import type { MedicineApplicationFrequency } from './types';

export type MedicineApplicationKind = 'realized' | 'scheduled';

export type MedicineApplicationFormValues = {
  kind: MedicineApplicationKind;
  medicineUuid: string;
  quantity: string;
  date: string;
  endDate: string;
  time: string;
  frequency: MedicineApplicationFrequency;
};

export type MedicineApplicationFormFieldErrors = Partial<Record<keyof MedicineApplicationFormValues, string>>;

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function createMedicineApplicationFormValues(
  kind: MedicineApplicationKind = 'scheduled',
  referenceDate = new Date(),
): MedicineApplicationFormValues {
  const targetDate = new Date(referenceDate);
  targetDate.setSeconds(0, 0);
  if (kind === 'scheduled') targetDate.setHours(targetDate.getHours() + 1);
  const endDate = new Date(targetDate);
  endDate.setDate(endDate.getDate() + 7);

  return {
    kind,
    medicineUuid: '',
    quantity: '',
    date: `${pad(targetDate.getDate())}/${pad(targetDate.getMonth() + 1)}/${targetDate.getFullYear()}`,
    endDate: `${pad(endDate.getDate())}/${pad(endDate.getMonth() + 1)}/${endDate.getFullYear()}`,
    time: `${pad(targetDate.getHours())}:${pad(targetDate.getMinutes())}`,
    frequency: 'não se repete',
  };
}
