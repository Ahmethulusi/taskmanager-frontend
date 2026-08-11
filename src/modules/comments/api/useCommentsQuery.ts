import { useQuery } from '@tanstack/react-query'

import { getComments } from '@/modules/comments/api/commentsApi'

export function useCommentsQuery(taskId: string) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => getComments(taskId),
    enabled: !!taskId,
  })
}
