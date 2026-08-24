import {
  STATUS_COLOR_MAP,
  type StatusColorKey,
} from '@/lib/statusColors'
import { cn } from '@/lib/utils'
import { TaskActionsMenu } from '@/modules/tasks/components/TaskActionsMenu'
import type { TaskDto } from '@/modules/tasks/utils/types'

interface CalendarTaskChipProps {
  task: TaskDto
  onClick: () => void
}

export function CalendarTaskChip({ task, onClick }: CalendarTaskChipProps) {
  const color =
    STATUS_COLOR_MAP[task.statusColorKey as StatusColorKey] ?? STATUS_COLOR_MAP.gray

  return (
    <div
      className={cn(
        'flex h-6 w-full items-center gap-0.5 rounded px-0.5',
        task.isOverdue
          ? 'border-2 border-destructive'
          : 'border border-transparent'
      )}
      style={{ backgroundColor: color.bg, color: color.dot }}
    >
      <button
        type="button"
        className="min-w-0 flex-1 truncate px-1 text-left text-xs font-medium"
        title={task.title}
        onClick={onClick}
      >
        {task.title}
      </button>
      <TaskActionsMenu
        task={task}
        compact
        className="size-5 hover:bg-black/5 dark:hover:bg-white/10"
      />
    </div>
  )
}
