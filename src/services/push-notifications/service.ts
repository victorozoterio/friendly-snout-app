import { api } from '../api';

export type RegisterPushDeviceInput = {
  expoPushToken: string;
  platform: 'android' | 'ios';
};

/** Registra ou reativa o dispositivo atual para receber notificações push. */
export async function registerPushDevice(input: RegisterPushDeviceInput) {
  await api.post('/push-notifications/devices', input);
}

/** Desativa o token do dispositivo atual ao encerrar a sessão. */
export async function unregisterPushDevice(expoPushToken: string) {
  await api.delete('/push-notifications/devices', { data: { expoPushToken } });
}
