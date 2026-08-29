import { z } from 'zod';

const requiredMessage = 'Campo obrigatório';
const requiredTextSchema = z.string().trim().min(1, requiredMessage);
const testResultSchema = z.enum(['sim', 'não', 'não testado']).or(z.literal(''));

const animalFormValuesSchema = z.object({
  name: requiredTextSchema,
  sex: z.enum(['macho', 'fêmea'], { error: 'Selecione o sexo' }).or(z.literal('')),
  speciesUuid: z.string().uuid('Selecione a espécie'),
  breedUuid: z.string().uuid('Selecione a raça'),
  size: z.enum(['pequeno', 'médio', 'grande'], { error: 'Selecione o porte' }).or(z.literal('')),
  color: requiredTextSchema,
  birthDate: z
    .string()
    .refine((value) => value.length === 0 || /^\d{2}\/\d{2}\/\d{4}$/.test(value), 'Use o formato DD/MM/AAAA')
    .refine((value) => {
      if (!value) return true;

      const [day, month, year] = value.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    }, 'Informe uma data válida')
    .refine((value) => {
      if (!value) return true;

      const [day, month, year] = value.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return date <= today;
    }, 'A data não pode estar no futuro'),
  microchip: z.string(),
  rga: z.string(),
  castrated: z.enum(['true', 'false'], { error: 'Informe se o animal é castrado' }).or(z.literal('')),
  fiv: testResultSchema,
  felv: testResultSchema,
  status: z.enum(['quarentena', 'acolhido', 'adotado', 'perdido']),
  notes: z.string(),
});

export function getAnimalFormSchema(isFeline: boolean) {
  return animalFormValuesSchema.superRefine((values, context) => {
    if (!values.sex) {
      context.addIssue({ code: 'custom', message: 'Selecione o sexo', path: ['sex'] });
    }

    if (!values.size) {
      context.addIssue({ code: 'custom', message: 'Selecione o porte', path: ['size'] });
    }

    if (!values.castrated) {
      context.addIssue({ code: 'custom', message: 'Informe se o animal é castrado', path: ['castrated'] });
    }

    if (isFeline && !values.fiv) {
      context.addIssue({ code: 'custom', message: 'Selecione o resultado de FIV', path: ['fiv'] });
    }

    if (isFeline && !values.felv) {
      context.addIssue({ code: 'custom', message: 'Selecione o resultado de FELV', path: ['felv'] });
    }
  });
}

export type AnimalFormValues = z.infer<typeof animalFormValuesSchema>;

export type AnimalFormFieldErrors = Partial<Record<keyof AnimalFormValues, string>>;

export const emptyAnimalFormValues: AnimalFormValues = {
  name: '',
  sex: '',
  speciesUuid: '',
  breedUuid: '',
  size: '',
  color: '',
  birthDate: '',
  microchip: '',
  rga: '',
  castrated: '',
  fiv: '',
  felv: '',
  status: 'quarentena',
  notes: '',
};

export function toApiBirthDate(value: string) {
  if (!value) return undefined;
  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

export function toFormBirthDate(value: string | null) {
  if (!value) return '';
  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
}
