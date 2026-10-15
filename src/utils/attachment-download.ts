import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { Attachment } from '../services/attachments';
import { getAttachmentName, isImageAttachment } from './attachment';

type AttachmentDownloadResult = 'cancelled' | 'permission-denied' | 'saved' | 'shared';

function getAttachmentMimeType(attachment: Attachment) {
  const type = attachment.type.toLocaleLowerCase('pt-BR');

  if (type === 'jpg' || type === 'jpeg') return 'image/jpeg';
  if (type === 'png') return 'image/png';
  if (type === 'avif') return 'image/avif';
  if (type === 'webp') return 'image/webp';
  if (type === 'pdf') return 'application/pdf';
  return 'application/octet-stream';
}

function getSafeAttachmentName(attachment: Attachment) {
  const name = getAttachmentName(attachment).replace(/[^a-zA-Z0-9._-]/g, '_');
  const extension = attachment.type.toLocaleLowerCase('pt-BR');
  return name.includes('.') ? name : `${name}.${extension}`;
}

async function downloadToCache(attachment: Attachment) {
  if (!FileSystem.cacheDirectory) throw new Error('Diretório temporário indisponível.');

  const fileUri = `${FileSystem.cacheDirectory}${Date.now()}-${getSafeAttachmentName(attachment)}`;
  const result = await FileSystem.downloadAsync(attachment.url, fileUri);

  if (result.status < 200 || result.status >= 300) {
    throw new Error('Não foi possível baixar o arquivo.');
  }

  return result.uri;
}

async function saveImageToGallery(fileUri: string): Promise<AttachmentDownloadResult> {
  const permission = await MediaLibrary.requestPermissionsAsync(true);
  if (!permission.granted) return 'permission-denied';

  await MediaLibrary.saveToLibraryAsync(fileUri);
  return 'saved';
}

async function saveDocumentOnAndroid(attachment: Attachment, fileUri: string): Promise<AttachmentDownloadResult> {
  const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permission.granted) return 'cancelled';

  const contents = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
  const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
    permission.directoryUri,
    getSafeAttachmentName(attachment),
    getAttachmentMimeType(attachment),
  );
  await FileSystem.writeAsStringAsync(destinationUri, contents, { encoding: FileSystem.EncodingType.Base64 });
  return 'saved';
}

async function saveDocumentOniOS(attachment: Attachment, fileUri: string): Promise<AttachmentDownloadResult> {
  if (!(await Sharing.isAvailableAsync())) throw new Error('O compartilhamento de arquivos não está disponível.');

  await Sharing.shareAsync(fileUri, {
    dialogTitle: `Salvar ${getAttachmentName(attachment)}`,
    mimeType: getAttachmentMimeType(attachment),
  });
  return 'shared';
}

/**
 * Baixa um anexo e o salva na galeria ou no armazenamento público do dispositivo.
 * No iOS, documentos usam o fluxo nativo de “Salvar em Arquivos”.
 */
export async function downloadAttachmentToDevice(attachment: Attachment): Promise<AttachmentDownloadResult> {
  const fileUri = await downloadToCache(attachment);

  try {
    if (isImageAttachment(attachment)) return await saveImageToGallery(fileUri);
    if (Platform.OS === 'android') return await saveDocumentOnAndroid(attachment, fileUri);
    if (Platform.OS === 'ios') return await saveDocumentOniOS(attachment, fileUri);
    throw new Error('O download não é compatível com esta plataforma.');
  } finally {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  }
}
