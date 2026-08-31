import type { Attachment, AttachmentUpload } from '../services/attachments';

export const maxAttachmentFileSize = 10 * 1024 * 1024;

export const supportedAttachmentMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/avif',
  'image/webp',
  'application/pdf',
] as const;

type SupportedAttachmentMimeType = (typeof supportedAttachmentMimeTypes)[number];

export type PickedAttachmentFile = {
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  size?: number | null;
  uri: string;
};

/**
 * Informa se o anexo pode ser apresentado como imagem no aplicativo.
 */
export function isImageAttachment(attachment: Attachment): boolean {
  return ['jpeg', 'jpg', 'png', 'avif', 'webp'].includes(attachment.type.toLocaleLowerCase('pt-BR'));
}

/**
 * Retorna um nome seguro para exibição quando o backend não informar um nome válido.
 */
export function getAttachmentName(attachment: Attachment): string {
  return attachment.name?.trim() || 'Anexo';
}

/**
 * Normaliza o tipo MIME informado pelo seletor ou inferido pela extensão do arquivo.
 */
export function getAttachmentMimeType(file: PickedAttachmentFile): SupportedAttachmentMimeType | null {
  if (file.mimeType === 'image/jpg') return 'image/jpeg';
  if (file.mimeType && supportedAttachmentMimeTypes.includes(file.mimeType as SupportedAttachmentMimeType)) {
    return file.mimeType as SupportedAttachmentMimeType;
  }

  const fileName = file.fileName?.toLocaleLowerCase('pt-BR') ?? '';
  const extension = fileName.split('.').pop();

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
    case 'pdf':
      return 'application/pdf';
    default:
      return null;
  }
}

/**
 * Converte um arquivo escolhido no dispositivo no payload esperado pela rota de upload.
 */
export function createAttachmentUpload(file: PickedAttachmentFile): AttachmentUpload | null {
  const mimeType = getAttachmentMimeType(file);
  if (!mimeType) return null;

  const originalName = file.fileName?.trim() || 'anexo';
  const extensionStart = originalName.lastIndexOf('.');
  const baseName = extensionStart > 0 ? originalName.slice(0, extensionStart) : originalName;
  const extension = mimeType === 'application/pdf' ? 'pdf' : mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1];

  return {
    mimeType,
    name: `${baseName || 'anexo'}-${Date.now()}.${extension}`,
    uri: file.uri,
  };
}
