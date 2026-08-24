import { Plus } from 'lucide-react'

import { UserAvatar } from '@/components/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getStatusColor } from '@/lib/statusColors'
import { cn } from '@/lib/utils'
import { TaskActionsMenu } from '@/modules/tasks/components/TaskActionsMenu'
import { getPriorityDisplay } from '@/modules/tasks/utils/taskDisplay'
import { toDateKey } from '@/modules/tasks/utils/calendarDates'
import { groupTasksByDueDate } from '@/modules/tasks/utils/groupTasksByDueDate'
import type { TaskDto } from '@/modules/tasks/utils/types'

const PRIORITY_BADGE_CLASSES: Record<string, string> = {
  low: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  unknown: 'bg-muted text-muted-foreground',
}

interface CalendarDayListProps {
  anchorDate: Date
  tasks: TaskDto[]
  onTaskClick: (task: TaskDto) => void
  onCreateTask?: (date: Date) => void
}

export function CalendarDayList({
  anchorDate,
  tasks,
  onTaskClick,
  onCreateTask,
}: CalendarDayListProps) {
  const dayTasks = groupTasksByDueDate(tasks)[toDateKey(anchorDate)] ?? []

  return (
    <div className="space-y-2">
      {onCreateTask && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer border-primary/30 text-primary/60 hover:bg-primary/10 hover:text-primary"
            onClick={() => onCreateTask(anchorDate)}
          >
            <Plus />
            Bu güne görev ekle
          </Button>
        </div>
      )}

      {dayTasks.length === 0 ? (
        <p className="p-4 text-base text-muted-foreground">Bu gün için görev yok</p>
      ) : (
        dayTasks.map((task) => {
          const priority = getPriorityDisplay(task.priority)
          const statusColor = getStatusColor(task.statusColorKey)

          return (
            <div
              key={String(task.id)}
              role="button"
              tabIndex={0}
              className={cn(
                'flex w-full cursor-pointer items-center gap-4 rounded-md border p-3 text-left transition-colors hover:bg-muted/50',
                task.isOverdue && 'border-destructive'
              )}
              style={{ borderLeftColor: statusColor.dot, borderLeftWidth: 4 }}
              onClick={() => onTaskClick(task)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onTaskClick(task)
                }
              }}
            >
              <span className="min-w-0 flex-1 truncate font-heading font-medium">
                {task.title}
              </span>
              <Badge className={cn('h-6 text-sm', PRIORITY_BADGE_CLASSES[priority.variant])}>
                {priority.label}
              </Badge>
              {task.assignedUsers?.length ? (
                <span className="flex min-w-0 items-center gap-2">
                  <UserAvatar name={task.assignedUsers[0].fullName} size="sm" />
                  <span className="max-w-48 truncate">
                    {task.assignedUsers[0].fullName}
                  </span>
                  {task.assignedUsers.length > 1 && (
                    <span className="shrink-0 text-sm text-muted-foreground">
                      +{task.assignedUsers.length - 1}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Atanmadı</span>
              )}
              <TaskActionsMenu task={task} />
            </div>
          )
        })
      )}
    </div>
  )
}
