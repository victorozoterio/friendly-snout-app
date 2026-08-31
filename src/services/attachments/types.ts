export type Attachment = {
  uuid: string;
  name?: string;
  url: string;
  type: string;
  createdAt: string;
};

export type PaginatedAttachments = {
  data: Attachment[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
};

export type AttachmentUpload = {
  uri: string;
  name: string;
  mimeType: string;
};
