import { z } from 'zod';

import { parseApplicationDateTime } from './date';

export const medicineApplicationFormSchema = z
  .object({
    kind: z.enum(['realized', 'scheduled']),
    medicineUuid: z.string().min(1, 'Selecione um medicamento'),
    quantity: z
      .string()
      .trim()
      .min(1, 'Informe a quantidade')
      .refine((value) => /^\d+$/.test(value) && Number(value) > 0, 'Informe uma quantidade inteira maior que zero'),
    date: z.string().min(1, 'Informe a data'),
    endDate: z.string(),
    time: z.string().min(1, 'Informe o horário'),
    frequency: z.enum(['não se repete', 'todos os dias da semana', 'diário', 'semanal', 'mensal', 'anual']),
  })
  .superRefine((values, context) => {
    const dateParts = values.date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const timeParts = values.time.match(/^(\d{2}):(\d{2})$/);
    const dateOnly = dateParts ? new Date(Number(dateParts[3]), Number(dateParts[2]) - 1, Number(dateParts[1])) : null;
    const hasValidDate = Boolean(
      dateParts &&
        dateOnly?.getFullYear() === Number(dateParts[3]) &&
        dateOnly.getMonth() === Number(dateParts[2]) - 1 &&
        dateOnly.getDate() === Number(dateParts[1]),
    );
    const hasValidTime = Boolean(
      timeParts && Number(timeParts[1]) >= 0 && Number(timeParts[1]) <= 23 && Number(timeParts[2]) <= 59,
    );
    const dateTime = parseApplicationDateTime(values.date, values.time);
    const endDateTime = parseApplicationDateTime(values.endDate, values.time);

    if (!hasValidDate)
      context.addIssue({ code: 'custom', message: 'Informe uma data válida (DD/MM/AAAA)', path: ['date'] });
    if (!hasValidTime)
      context.addIssue({ code: 'custom', message: 'Informe um horário válido (HH:mm)', path: ['time'] });
    if (!dateTime) return;

    const isRecurring = values.kind === 'scheduled' && values.frequency !== 'não se repete';
    if (isRecurring && !endDateTime) {
      context.addIssue({ code: 'custom', message: 'Informe uma data final válida', path: ['endDate'] });
      return;
    }

    const now = Date.now();
    if (values.kind === 'scheduled' && dateTime.getTime() <= now) {
      context.addIssue({ code: 'custom', message: 'O agendamento deve estar no futuro', path: ['date'] });
    }

    if (isRecurring && endDateTime && endDateTime.getTime() < dateTime.getTime()) {
      context.addIssue({
        code: 'custom',
        message: 'A data de término não pode ser anterior à data de início',
        path: ['endDate'],
      });
    }

    if (values.kind === 'realized' && dateTime.getTime() > now + 60_000) {
      context.addIssue({ code: 'custom', message: 'Uma aplicação realizada não pode estar no futuro', path: ['date'] });
    }
  });
