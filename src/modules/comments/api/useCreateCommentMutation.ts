import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createComment } from '@/modules/comments/api/commentsApi'

interface CreateCommentVariables {
  taskId: string
  content: string
}

export function useCreateCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, content }: CreateCommentVariables) => createComment(taskId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
