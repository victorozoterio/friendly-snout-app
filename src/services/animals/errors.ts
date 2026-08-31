import axios from 'axios';

type ApiErrorBody = {
  message?: string | string[];
};

export function getAnimalErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback;

  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.join('\n');
  if (typeof message === 'string' && message.trim()) return message;

  return fallback;
}
