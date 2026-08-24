import { useMutation, useQueryClient } from '@tanstack/react-query'

import { markAllAsRead } from '@/modules/notifications/api/notificationsApi'

export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
