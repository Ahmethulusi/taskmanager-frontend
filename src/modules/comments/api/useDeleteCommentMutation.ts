import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteComment } from '@/modules/comments/api/commentsApi'

interface DeleteCommentVariables {
  commentId: string
  taskId: string
}

export function useDeleteCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId }: DeleteCommentVariables) => deleteComment(commentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
