import { api } from '../api';

import type { Attachment, AttachmentUpload, PaginatedAttachments } from './types';

export async function getAnimalAttachments(animalUuid: string): Promise<PaginatedAttachments> {
  const { data } = await api.get<PaginatedAttachments>(`/attachments/by-animal/${animalUuid}`, {
    params: { limit: 100 },
  });
  return data;
}

export async function uploadAnimalAttachment(animalUuid: string, file: AttachmentUpload): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', {
    name: file.name,
    type: file.mimeType,
    uri: file.uri,
  } as unknown as Blob);

  const { data } = await api.post<Attachment>(`/attachments/animal/${animalUuid}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteAnimalAttachment(attachmentUuid: string): Promise<void> {
  await api.delete(`/attachments/${attachmentUuid}`);
}
