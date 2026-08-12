import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  confirmUpload,
  presignUpload,
  uploadToR2,
} from '@/modules/attachments/api/attachmentsApi'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

interface UploadAttachmentVariables {
  taskId: string
  file: File
}

export function useUploadAttachmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, file }: UploadAttachmentVariables) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error("Dosya boyutu 10MB'ı geçemez.")
      }
      const { uploadUrl, storageKey } = await presignUpload(
        taskId,
        file.name,
        file.type,
        file.size
      )
      await uploadToR2(uploadUrl, file)
      return confirmUpload({
        storageKey,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        taskId,
      })
    },
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] })
    },
  })
}
