import { api } from '../api';

type PresignedUrlResponse = {
  uploadUrl: string;
  publicUrl: string;
};

/**
 * Solicita uma URL pré-assinada (Presigned URL) ao backend para realizar
 * o upload seguro de imagem para o Cloudflare R2 sem expor chaves secretas no cliente.
 */
export async function getPresignedUploadUrl(animalUuid: string, fileName: string): Promise<PresignedUrlResponse> {
  const { data } = await api.post<PresignedUrlResponse>(`/animals/${animalUuid}/photos/upload-url`, {
    fileName,
    contentType: 'image/jpeg',
  });
  return data;
}

/**
 * Realiza o upload direto do arquivo para a URL pré-assinada da Cloudflare R2
 */
export async function uploadToPresignedUrl(uploadUrl: string, fileUri: string): Promise<void> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const uploadResult = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/jpeg',
    },
    body: blob,
  });

  if (!uploadResult.ok) {
    throw new Error(`Falha no upload para o Cloudflare R2 (Status: ${uploadResult.status})`);
  }
}
