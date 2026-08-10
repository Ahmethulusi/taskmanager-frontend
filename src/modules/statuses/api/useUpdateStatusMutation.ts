import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateStatus } from '@/modules/statuses/api/statusesApi'
import type { UpdateTaskStatusDto } from '@/modules/statuses/utils/types'

interface UpdateStatusVariables {
  id: string
  dto: UpdateTaskStatusDto
}

export function useUpdateStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: UpdateStatusVariables) => updateStatus(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
