import { useQuery } from '@tanstack/react-query'

import { getUnreadCount } from '@/modules/notifications/api/notificationsApi'

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  })
}
