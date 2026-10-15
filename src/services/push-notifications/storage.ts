import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PUSH_TOKEN_KEY = 'friendly_snout_expo_push_token';

function getWebStorage() {
  return Platform.OS === 'web' && typeof localStorage !== 'undefined' ? localStorage : null;
}

/** Persiste o token do dispositivo para desativá-lo corretamente no logout. */
export async function saveStoredPushToken(token: string) {
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.setItem(PUSH_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token, { keychainAccessible: SecureStore.WHEN_UNLOCKED });
}

/** Obtém o último token registrado neste dispositivo. */
export async function getStoredPushToken() {
  const webStorage = getWebStorage();
  return webStorage ? webStorage.getItem(PUSH_TOKEN_KEY) : SecureStore.getItemAsync(PUSH_TOKEN_KEY);
}

/** Remove o token local depois que o backend o desativa. */
export async function clearStoredPushToken() {
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.removeItem(PUSH_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
}
