import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteAttachment } from '@/modules/attachments/api/attachmentsApi'

interface DeleteAttachmentVariables {
  id: string
  taskId: string
}

export function useDeleteAttachmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: DeleteAttachmentVariables) => deleteAttachment(id),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] })
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] })
    },
  })
}
