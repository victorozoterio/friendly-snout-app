import Constants from 'expo-constants';
import * as Device from 'expo-device';
import type * as NotificationsModule from 'expo-notifications';
import { useRouter } from 'expo-router';
import { type PropsWithChildren, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { animalRoutes } from '../routes';
import { registerPushDevice } from '../services/push-notifications/service';
import { saveStoredPushToken } from '../services/push-notifications/storage';
import { useAuth } from './auth-context';

type MedicineNotificationData = {
  animalUuid?: string;
  type?: string;
};

function loadNotificationsModule(): typeof NotificationsModule | null {
  try {
    return require('expo-notifications') as typeof NotificationsModule;
  } catch {
    return null;
  }
}

const notifications = loadNotificationsModule();

notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getProjectId() {
  return (
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID
  );
}

async function getExpoPushToken() {
  if (!notifications || !Device.isDevice || Platform.OS === 'web') return null;

  if (Platform.OS === 'android') {
    await notifications.setNotificationChannelAsync('medicine-reminders', {
      importance: notifications.AndroidImportance.HIGH,
      name: 'Lembretes de medicamentos',
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const permission = await notifications.getPermissionsAsync();
  const finalPermission = permission.granted ? permission : await notifications.requestPermissionsAsync();
  if (!finalPermission.granted) return null;

  const projectId = getProjectId();
  if (!projectId) return null;

  return (await notifications.getExpoPushTokenAsync({ projectId })).data;
}

function getAnimalUuid(response: NotificationsModule.NotificationResponse) {
  const data = response.notification.request.content.data as MedicineNotificationData;
  return data.type === 'medicine-application-reminder' ? data.animalUuid : undefined;
}

/** Registra o dispositivo autenticado e encaminha toques em lembretes de medicamento. */
export function PushNotificationsProvider({ children }: PropsWithChildren) {
  const { status } = useAuth();
  const router = useRouter();
  const handledNotificationId = useRef<string | null>(null);

  useEffect(() => {
    if (!notifications) return;

    const openReminder = (response: NotificationsModule.NotificationResponse) => {
      if (handledNotificationId.current === response.notification.request.identifier) return;
      const animalUuid = getAnimalUuid(response);
      if (!animalUuid) return;

      handledNotificationId.current = response.notification.request.identifier;
      router.push(animalRoutes.medicines(animalUuid) as never);
    };

    const subscription = notifications.addNotificationResponseReceivedListener(openReminder);
    void notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openReminder(response);
    });

    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const registerDevice = async () => {
      try {
        const expoPushToken = await getExpoPushToken();
        if (!expoPushToken || (Platform.OS !== 'android' && Platform.OS !== 'ios')) return;

        await registerPushDevice({ expoPushToken, platform: Platform.OS });
        await saveStoredPushToken(expoPushToken);
      } catch {
        // A indisponibilidade do serviço push não pode bloquear a sessão do usuário.
      }
    };

    void registerDevice();
  }, [status]);

  return children;
}
