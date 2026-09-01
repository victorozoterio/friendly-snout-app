import axios from 'axios';

type ApiErrorBody = {
  message?: string | string[];
};

export function getMedicineErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback;

  if (error.response?.status === 409) {
    return 'Já existe um medicamento com esse nome para a marca selecionada.';
  }

  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.join('\n');
  if (typeof message === 'string' && message.trim()) return message;

  return fallback;
}

export function getMedicineBrandErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback;

  if (error.response?.status === 409) {
    return 'Já existe uma marca com esse nome.';
  }

  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.join('\n');
  if (typeof message === 'string' && message.trim()) return message;

  return fallback;
}
