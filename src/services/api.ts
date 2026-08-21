import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { API_KEY, API_URL } from '../config/env';
import { tokenStorage } from './auth/storage';

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  if (API_KEY) config.headers.set('x-api-key', API_KEY);
  if (config.url?.includes('/auth/refresh-token')) return config;

  const accessToken = await tokenStorage.getAccessToken();
  if (accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`);

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    const isUnauthorized = error.response?.status === 401;
    const isAuthRequest = originalRequest?.url?.includes('/auth/sign-in');
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh-token');

    if (!originalRequest || !isUnauthorized || originalRequest._retry || isAuthRequest || isRefreshRequest) {
      return Promise.reject(error);
    }

    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
      await tokenStorage.clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh-token', {
        refreshToken,
      });

      await tokenStorage.setTokens(data.accessToken, data.refreshToken);
      originalRequest.headers.set('Authorization', `Bearer ${data.accessToken}`);

      return api(originalRequest);
    } catch (refreshError) {
      await tokenStorage.clearTokens();
      return Promise.reject(refreshError);
    }
  },
);
