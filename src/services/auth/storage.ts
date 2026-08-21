import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'friendly_snout_accessToken';
const REFRESH_TOKEN_KEY = 'friendly_snout_refreshToken';

const getWebStorage = () => (Platform.OS === 'web' && typeof localStorage !== 'undefined' ? localStorage : null);

const getItem = async (key: string) => {
  const webStorage = getWebStorage();
  if (webStorage) return webStorage.getItem(key);

  return SecureStore.getItemAsync(key);
};

const setItem = async (key: string, value: string) => {
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
};

const deleteItem = async (key: string) => {
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
};

export const tokenStorage = {
  getAccessToken: () => getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => getItem(REFRESH_TOKEN_KEY),
  setTokens: async (accessToken: string, refreshToken: string) => {
    await Promise.all([setItem(ACCESS_TOKEN_KEY, accessToken), setItem(REFRESH_TOKEN_KEY, refreshToken)]);
  },
  clearTokens: async () => {
    await Promise.all([deleteItem(ACCESS_TOKEN_KEY), deleteItem(REFRESH_TOKEN_KEY)]);
  },
};
