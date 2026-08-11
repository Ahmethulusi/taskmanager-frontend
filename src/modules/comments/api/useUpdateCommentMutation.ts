import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateComment } from '@/modules/comments/api/commentsApi'

interface UpdateCommentVariables {
  commentId: string
  taskId: string
  content: string
}

export function useUpdateCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, content }: UpdateCommentVariables) =>
      updateComment(commentId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
