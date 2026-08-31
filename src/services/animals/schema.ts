import { z } from 'zod';

import { isFutureBrazilianDate, isValidBrazilianDate } from '../../utils/date';
import type { AnimalFormValues } from './form.types';

const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;

function addFieldError(context: z.RefinementCtx, field: keyof AnimalFormValues, message: string) {
  context.addIssue({
    code: 'custom',
    message,
    path: [field],
  });
}

const animalFormValuesSchema = z.object({
  name: z.string().trim().min(1, 'Campo obrigatório'),
  sex: z.enum(['macho', 'fêmea'], { error: 'Selecione o sexo' }).or(z.literal('')),
  speciesUuid: z.string('Selecione a espécie'),
  breedUuid: z.string('Selecione a raça'),
  size: z.enum(['pequeno', 'médio', 'grande'], { error: 'Selecione o porte' }).or(z.literal('')),
  color: z.string().trim().min(1, 'Campo obrigatório'),
  birthDate: z.string().superRefine((value, context) => {
    if (!value) return;

    if (!datePattern.test(value)) {
      context.addIssue({
        code: 'custom',
        message: 'Use o formato DD/MM/AAAA',
      });
      return;
    }

    if (!isValidBrazilianDate(value)) {
      context.addIssue({
        code: 'custom',
        message: 'Informe uma data válida',
      });
      return;
    }

    if (isFutureBrazilianDate(value)) {
      context.addIssue({
        code: 'custom',
        message: 'A data não pode estar no futuro',
      });
    }
  }),
  microchip: z.string(),
  rga: z.string(),
  castrated: z.enum(['true', 'false'], { error: 'Informe se o animal é castrado' }).or(z.literal('')),
  fiv: z.enum(['sim', 'não', 'não testado']).or(z.literal('')),
  felv: z.enum(['sim', 'não', 'não testado']).or(z.literal('')),
  status: z.enum(['quarentena', 'acolhido', 'adotado', 'perdido']),
  notes: z.string(),
});

/**
 * Cria o schema de validação do formulário conforme a espécie selecionada.
 */
export function getAnimalFormSchema(isFeline: boolean) {
  return animalFormValuesSchema.superRefine((values, context) => {
    if (!values.sex) addFieldError(context, 'sex', 'Selecione o sexo');
    if (!values.size) addFieldError(context, 'size', 'Selecione o porte');
    if (!values.castrated) addFieldError(context, 'castrated', 'Informe se o animal é castrado');
    if (!isFeline) return;
    if (!values.fiv) addFieldError(context, 'fiv', 'Selecione o resultado de FIV');
    if (!values.felv) addFieldError(context, 'felv', 'Selecione o resultado de FELV');
  });
}
