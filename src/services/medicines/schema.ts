import { z } from 'zod';

export const medicineFormSchema = z.object({
  name: z.string().trim().min(1, 'Campo obrigatório'),
  description: z.string(),
  quantity: z
    .string()
    .trim()
    .min(1, 'Campo obrigatório')
    .regex(/^\d+$/, 'Informe um número inteiro válido')
    .refine((value) => Number(value) <= 1_000_000, 'Quantidade muito alta'),
  medicineBrandUuid: z.string().min(1, 'Selecione a marca'),
});

export const medicineBrandFormSchema = z.object({
  name: z.string().trim().min(1, 'Campo obrigatório'),
});
