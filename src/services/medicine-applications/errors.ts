import axios from 'axios';

type ApiErrorBody = {
  message?: string | string[];
};

const translatedMessages: Record<string, string> = {
  'Animal does not exist': 'O animal informado não foi encontrado.',
  'Insufficient medicine quantity': 'A quantidade informada é maior que o estoque disponível.',
  'Medicine application does not exist': 'O agendamento não foi encontrado ou já foi cancelado.',
  'Medicine does not exist': 'O medicamento selecionado não foi encontrado.',
};

function translateMessage(message: string) {
  return translatedMessages[message] ?? message;
}

export function getMedicineApplicationErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback;

  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.map(translateMessage).join('\n');
  if (message === 'Internal server error') return fallback;
  if (typeof message === 'string' && message.trim()) return translateMessage(message);

  return fallback;
}
