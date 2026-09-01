export type MedicineFormValues = {
  name: string;
  description: string;
  quantity: string;
  medicineBrandUuid: string;
};

export type MedicineFormFieldErrors = Partial<Record<keyof MedicineFormValues, string | undefined>>;

export const emptyMedicineFormValues: MedicineFormValues = {
  name: '',
  description: '',
  quantity: '',
  medicineBrandUuid: '',
};
