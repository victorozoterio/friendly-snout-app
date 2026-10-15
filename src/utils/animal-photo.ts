import type { AnimalPhotoUpload } from '../services/animals';

export const maxAnimalPhotoFileSize = 10 * 1024 * 1024;

const supportedAnimalPhotoMimeTypes = ['image/jpeg', 'image/png', 'image/avif', 'image/webp'] as const;

type PickedAnimalPhoto = {
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  uri: string;
};

/**
 * Converte uma imagem selecionada no dispositivo no payload da foto principal.
 */
export function createAnimalPhotoUpload(photo: PickedAnimalPhoto): AnimalPhotoUpload | null {
  const mimeType = getAnimalPhotoMimeType(photo);
  if (!mimeType) return null;

  const originalName = photo.fileName?.trim() || 'foto-do-animal';
  const extensionStart = originalName.lastIndexOf('.');
  const baseName = extensionStart > 0 ? originalName.slice(0, extensionStart) : originalName;
  const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1];

  return {
    mimeType,
    name: `${baseName || 'foto-do-animal'}-${Date.now()}.${extension}`,
    uri: photo.uri,
  };
}

/** Obtém um MIME de imagem aceito pela API a partir dos metadados do seletor. */
function getAnimalPhotoMimeType(photo: PickedAnimalPhoto): (typeof supportedAnimalPhotoMimeTypes)[number] | null {
  if (photo.mimeType === 'image/jpg') return 'image/jpeg';
  if (
    photo.mimeType &&
    supportedAnimalPhotoMimeTypes.includes(photo.mimeType as (typeof supportedAnimalPhotoMimeTypes)[number])
  ) {
    return photo.mimeType as (typeof supportedAnimalPhotoMimeTypes)[number];
  }

  const extension = photo.fileName?.toLocaleLowerCase('pt-BR').split('.').pop();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'avif':
      return 'image/avif';
    case 'webp':
      return 'image/webp';
    default:
      return null;
  }
}
