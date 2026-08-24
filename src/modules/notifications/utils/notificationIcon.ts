import { AtSign, Bell, Clock, MessageCircle, UserPlus, type LucideIcon } from 'lucide-react'

import type { NotificationType } from '@/modules/notifications/utils/types'

export function getNotificationIcon(type: NotificationType | string): LucideIcon {
  if (type === 'TaskAssigned') return UserPlus
  if (type === 'DeadlineApproaching') return Clock
  if (type === 'NewComment') return MessageCircle
  if (type === 'Mention') return AtSign
  return Bell
}
