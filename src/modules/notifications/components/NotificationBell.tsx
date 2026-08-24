import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMarkAllAsReadMutation } from '@/modules/notifications/api/useMarkAllAsReadMutation'
import { useMarkAsReadMutation } from '@/modules/notifications/api/useMarkAsReadMutation'
import { useNotificationsQuery } from '@/modules/notifications/api/useNotificationsQuery'
import { useUnreadCountQuery } from '@/modules/notifications/api/useUnreadCountQuery'
import { getNotificationIcon } from '@/modules/notifications/utils/notificationIcon'
import type { NotificationDto } from '@/modules/notifications/utils/types'
import { cn } from '@/lib/utils'

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const unreadCountQuery = useUnreadCountQuery()
  const notificationsQuery = useNotificationsQuery(open)
  const markAsReadMutation = useMarkAsReadMutation()
  const markAllAsReadMutation = useMarkAllAsReadMutation()

  const unreadCount = unreadCountQuery.data ?? 0
  const notifications = notificationsQuery.data ?? []

  function handleNotificationClick(notification: NotificationDto) {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id)
    }
    if (notification.relatedTaskId) {
      navigate(`/tasks/${notification.relatedTaskId}`)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative group-data-[collapsible=icon]:size-10"
          >
            <Bell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="start" side="right" className="w-80 gap-2 p-0">
        <div className="flex items-center justify-between px-3 pt-3">
          <span className="font-heading text-sm font-semibold">Bildirimler</span>
          {notifications.length > 0 && (
            <button
              type="button"
              className="text-xs text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
              disabled={markAllAsReadMutation.isPending}
              onClick={() => markAllAsReadMutation.mutate()}
            >
              Tümünü Okundu İşaretle
            </button>
          )}
        </div>

        <div className="flex max-h-[400px] flex-col gap-1 overflow-y-auto p-2">
          {notificationsQuery.isLoading && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">Yükleniyor...</div>
          )}

          {!notificationsQuery.isLoading && notifications.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">Bildirim yok</div>
          )}

          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type)
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'flex items-start gap-2.5 rounded-md p-2 text-left transition-colors hover:bg-muted',
                  !notification.isRead && 'bg-muted/60'
                )}
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{notification.title}</div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {dateFormatter.format(new Date(notification.createdAt))}
                  </div>
                </div>
                {!notification.isRead && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
