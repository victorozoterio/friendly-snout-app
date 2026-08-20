import { api } from '../api';
import type { RefreshTokenResponse, SignInRequest, SignInResponse } from './types';

export const signIn = async (payload: SignInRequest) => {
  const { data } = await api.post<SignInResponse>('/auth/sign-in', payload);
  return data;
};

export const refreshToken = async (refreshTokenValue: string) => {
  const { data } = await api.post<RefreshTokenResponse>('/auth/refresh-token', {
    refreshToken: refreshTokenValue,
  });
  return data;
};
