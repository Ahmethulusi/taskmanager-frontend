import { useDraggable } from '@dnd-kit/core'

import {
  STATUS_COLOR_MAP,
  type StatusColorKey,
} from '@/lib/statusColors'
import { cn } from '@/lib/utils'
import { TaskActionsMenu } from '@/modules/tasks/components/TaskActionsMenu'
import type { TaskDto } from '@/modules/tasks/utils/types'

function getChipColor(task: TaskDto) {
  return STATUS_COLOR_MAP[task.statusColorKey as StatusColorKey] ?? STATUS_COLOR_MAP.gray
}

function getChipClassName(task: TaskDto) {
  return cn(
    'flex h-6 w-full items-center gap-0.5 rounded px-0.5',
    task.isOverdue ? 'border-2 border-destructive' : 'border border-transparent'
  )
}

interface CalendarTaskChipProps {
  task: TaskDto
  onClick: () => void
  draggable?: boolean
}

export function CalendarTaskChip({ task, onClick, draggable = true }: CalendarTaskChipProps) {
  const color = getChipColor(task)
  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: `calendar-task-${task.id}`,
    data: { task },
    disabled: !draggable,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      className={cn(
        getChipClassName(task),
        draggable && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40'
      )}
      style={{ backgroundColor: color.bg, color: color.dot }}
    >
      <button
        type="button"
        className="min-w-0 flex-1 cursor-[inherit] truncate px-1 text-left text-xs font-medium"
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

export function CalendarTaskChipOverlay({ task }: { task: TaskDto }) {
  const color = getChipColor(task)

  return (
    <div
      className={cn(getChipClassName(task), 'w-44 cursor-grabbing shadow-lg')}
      style={{ backgroundColor: color.bg, color: color.dot }}
    >
      <span className="min-w-0 flex-1 truncate px-1 text-xs font-medium">{task.title}</span>
    </div>
  )
}
