import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toggleReaction } from '@/modules/comments/api/commentsApi'

interface ToggleReactionVariables {
  commentId: string
  taskId: string
  emoji: string
}

export function useToggleReactionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, emoji }: ToggleReactionVariables) =>
      toggleReaction(commentId, emoji),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.taskId] })
    },
  })
}
