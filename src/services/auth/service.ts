import { api } from '../api';

import type { RefreshTokenResponse, SignInRequest, SignInResponse } from './types';

export async function signIn(payload: SignInRequest): Promise<SignInResponse> {
  const { data } = await api.post<SignInResponse>('/auth/sign-in', payload);
  return data;
}

export async function refreshToken(refreshTokenValue: string): Promise<RefreshTokenResponse> {
  const { data } = await api.post<RefreshTokenResponse>('/auth/refresh-token', {
    refreshToken: refreshTokenValue,
  });
  return data;
}
