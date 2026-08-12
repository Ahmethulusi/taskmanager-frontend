export interface AttachmentDto {
  id: string
  fileName: string
  fileSize: number
  contentType: string
  uploadedByUserId: string
  uploadedByUserName: string
  createdAt: string
  downloadUrl: string
}

export interface PresignUploadDto {
  taskId: string
  fileName: string
  contentType: string
  fileSizeBytes: number
}

export interface PresignUploadResponse {
  uploadUrl: string
  storageKey: string
}

export interface ConfirmUploadDto {
  storageKey: string
  fileName: string
  fileSize: number
  contentType: string
  taskId: string
}
