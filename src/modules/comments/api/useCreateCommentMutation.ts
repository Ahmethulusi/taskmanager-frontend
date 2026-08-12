import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createComment } from '@/modules/comments/api/commentsApi'

interface CreateCommentVariables {
  taskId: string
  content: string
  attachmentIds?: string[]
}

export function useCreateCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, content, attachmentIds }: CreateCommentVariables) =>
      createComment(taskId, content, attachmentIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['attachments', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
