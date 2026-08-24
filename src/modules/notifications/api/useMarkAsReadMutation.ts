import { useMutation, useQueryClient } from '@tanstack/react-query'

import { markAsRead } from '@/modules/notifications/api/notificationsApi'

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
