import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const PHOTOS_KEY_PREFIX = '@friendly-snout:photos:';
const PROFILE_PHOTO_KEY_PREFIX = '@friendly-snout:profile_photo:';

const PHOTOS_DIRECTORY = `${FileSystem.documentDirectory}animal_photos/`;

/**
 * Copia uma foto temporária do cache (ImagePicker) para a pasta permanente do app
 */
async function makePermanentCopy(animalUuid: string, tempUri: string): Promise<string> {
  // Se não for arquivo local (ex: URL remota de rede), retorna diretamente
  if (!tempUri.startsWith('file://')) return tempUri;

  try {
    const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(PHOTOS_DIRECTORY, { intermediates: true });
    }

    const rawFileName = tempUri.split('/').pop() || `${Date.now()}.jpg`;
    const cleanFileName = rawFileName.split('?')[0];
    const permanentPath = `${PHOTOS_DIRECTORY}${animalUuid}_${cleanFileName}`;

    const fileInfo = await FileSystem.getInfoAsync(permanentPath);
    if (!fileInfo.exists) {
      await FileSystem.copyAsync({ from: tempUri, to: permanentPath });
    }

    return permanentPath;
  } catch (error) {
    console.error('Erro ao copiar foto para o diretório permanente:', error);
    return tempUri;
  }
}

export async function getAnimalPhotos(animalUuid: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(`${PHOTOS_KEY_PREFIX}${animalUuid}`);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch (error) {
    console.error('Erro ao ler fotos do animal:', error);
    return [];
  }
}

export async function saveAnimalPhoto(animalUuid: string, photoUri: string): Promise<string[]> {
  try {
    const permanentUri = await makePermanentCopy(animalUuid, photoUri);
    const current = await getAnimalPhotos(animalUuid);

    if (current.includes(permanentUri)) return current;

    const updated = [permanentUri, ...current];
    await AsyncStorage.setItem(`${PHOTOS_KEY_PREFIX}${animalUuid}`, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Erro ao salvar foto do animal:', error);
    return [];
  }
}

export async function removeAnimalPhoto(animalUuid: string, photoUri: string): Promise<string[]> {
  try {
    const current = await getAnimalPhotos(animalUuid);
    const updated = current.filter((item) => item !== photoUri);
    await AsyncStorage.setItem(`${PHOTOS_KEY_PREFIX}${animalUuid}`, JSON.stringify(updated));

    // Se for arquivo local permanente, deleta do sistema de arquivos
    if (photoUri.startsWith(PHOTOS_DIRECTORY)) {
      try {
        await FileSystem.deleteAsync(photoUri, { idempotent: true });
      } catch (deleteError) {
        console.error('Erro ao apagar arquivo local:', deleteError);
      }
    }

    // Se a foto removida for a de perfil, limpa do registro
    const currentProfilePhoto = await getAnimalProfilePhoto(animalUuid);
    if (currentProfilePhoto === photoUri) {
      await AsyncStorage.removeItem(`${PROFILE_PHOTO_KEY_PREFIX}${animalUuid}`);
    }

    return updated;
  } catch (error) {
    console.error('Erro ao remover foto do animal:', error);
    return [];
  }
}

export async function getAnimalProfilePhoto(animalUuid: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(`${PROFILE_PHOTO_KEY_PREFIX}${animalUuid}`);
  } catch (error) {
    console.error('Erro ao ler foto de perfil:', error);
    return null;
  }
}

export async function setAnimalProfilePhoto(animalUuid: string, photoUri: string): Promise<void> {
  try {
    const permanentUri = await makePermanentCopy(animalUuid, photoUri);
    await AsyncStorage.setItem(`${PROFILE_PHOTO_KEY_PREFIX}${animalUuid}`, permanentUri);
    await saveAnimalPhoto(animalUuid, permanentUri);
  } catch (error) {
    console.error('Erro ao definir foto de perfil:', error);
  }
}
