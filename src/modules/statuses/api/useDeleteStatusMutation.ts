import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteStatus } from '@/modules/statuses/api/statusesApi'

export function useDeleteStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
