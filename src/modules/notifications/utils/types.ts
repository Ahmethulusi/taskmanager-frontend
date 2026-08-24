export type NotificationType = 'TaskAssigned' | 'DeadlineApproaching' | 'NewComment' | 'Mention'

export interface NotificationDto {
  id: number
  type: NotificationType
  title: string
  message: string
  relatedTaskId: number | null
  isRead: boolean
  createdAt: string
}
