import axios from 'axios';

export function getSignInErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return 'Credenciais inválidas';
  }

  return 'Não foi possível acessar. Tente novamente.';
}
