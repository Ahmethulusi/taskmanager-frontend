import { apiFetch } from '@/lib/apiClient'
import type { NotificationDto } from '@/modules/notifications/utils/types'

export type { NotificationDto }

export function getNotifications(): Promise<NotificationDto[]> {
  return apiFetch<NotificationDto[]>('/api/notifications')
}

export function getUnreadCount(): Promise<number> {
  return apiFetch<number>('/api/notifications/unread-count')
}

export function markAsRead(id: number): Promise<void> {
  return apiFetch<void>(`/api/notifications/${id}/read`, {
    method: 'PUT',
  })
}

export function markAllAsRead(): Promise<void> {
  return apiFetch<void>('/api/notifications/read-all', {
    method: 'PUT',
  })
}
