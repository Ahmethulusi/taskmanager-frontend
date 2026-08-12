import { apiFetch } from '@/lib/apiClient'
import type {
  AttachmentDto,
  ConfirmUploadDto,
  PresignUploadResponse,
} from '@/modules/attachments/utils/types'

export function presignUpload(
  taskId: string,
  fileName: string,
  contentType: string,
  fileSizeBytes: number
): Promise<PresignUploadResponse> {
  return apiFetch<PresignUploadResponse>('/api/attachments/presign', {
    method: 'POST',
    body: { taskId, fileName, contentType, fileSizeBytes },
  })
}

export async function uploadToR2(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })

  if (!response.ok) {
    throw new Error('Dosya yüklenemedi')
  }
}

export function confirmUpload(params: ConfirmUploadDto): Promise<AttachmentDto> {
  return apiFetch<AttachmentDto>('/api/attachments/confirm', {
    method: 'POST',
    body: params,
  })
}

export function getTaskAttachments(taskId: string): Promise<AttachmentDto[]> {
  return apiFetch<AttachmentDto[]>(`/api/tasks/${taskId}/attachments`)
}

export function deleteAttachment(id: string): Promise<void> {
  return apiFetch<void>(`/api/attachments/${id}`, {
    method: 'DELETE',
  })
}
