import { useQuery } from '@tanstack/react-query'

import { getNotifications } from '@/modules/notifications/api/notificationsApi'

export function useNotificationsQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled,
  })
}
