import axios from 'axios';

type ApiErrorBody = {
  message?: string | string[];
};

export function getMedicineErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback;

  const message = error.response?.data?.message;

  if (error.response?.status === 409) {
    if (message === 'Applications were made with this medicine') {
      return 'Não é possível excluir este medicamento porque ele possui aplicações registradas.';
    }

    return 'Já existe um medicamento com esse nome para a marca selecionada.';
  }

  if (Array.isArray(message)) return message.join('\n');
  if (typeof message === 'string' && message.trim()) return message;

  return fallback;
}

export function getMedicineBrandErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback;

  const message = error.response?.data?.message;

  if (error.response?.status === 409) {
    if (message === 'Medicine brand has active medicines') {
      return 'Não é possível excluir esta marca porque ela possui medicamentos ativos.';
    }

    return 'Já existe uma marca com esse nome.';
  }

  if (Array.isArray(message)) return message.join('\n');
  if (typeof message === 'string' && message.trim()) return message;

  return fallback;
}
