import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createStatus } from '@/modules/statuses/api/statusesApi'
import type { CreateTaskStatusDto } from '@/modules/statuses/utils/types'

export function useCreateStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateTaskStatusDto) => createStatus(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
