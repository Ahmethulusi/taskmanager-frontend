import { useDroppable } from '@dnd-kit/core'

import { TaskCard } from '@/modules/tasks/components/TaskCard'
import { getStatusDisplay } from '@/modules/tasks/utils/taskDisplay'
import type { TaskDto } from '@/modules/tasks/utils/types'

const STATUS_SURFACE_CLASSES: Record<string, string> = {
  pending: 'border-status-pending-dot/40 bg-status-pending-bg',
  'in-progress': 'border-status-progress-dot/40 bg-status-progress-bg',
  done: 'border-status-done-dot/40 bg-status-done-bg',
  unknown: 'border-border bg-muted/30',
}

const STATUS_DOT_CLASSES: Record<string, string> = {
  pending: 'bg-status-pending-dot',
  'in-progress': 'bg-status-progress-dot',
  done: 'bg-status-done-dot',
  unknown: 'bg-muted-foreground',
}

interface TaskColumnProps {
  status: string
  label: string
  tasks: TaskDto[]
}

export function TaskColumn({ status, label, tasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const variant = getStatusDisplay(status).variant

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 flex-col rounded-lg border border-dashed p-4 shadow-[0_12px_20px_-14px_rgb(0_0_0/0.45)] ${
        STATUS_SURFACE_CLASSES[variant]
      } ${isOver ? 'ring-2 ring-primary/40' : ''}`}
    >
      <div className="mb-4 flex items-center gap-2 font-heading text-base font-medium">
        <span className={`size-2.5 shrink-0 rounded-full ${STATUS_DOT_CLASSES[variant]}`} />
        {label} ({tasks.length})
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto" style={{ maxHeight: '65vh' }}>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bu durumda görev yok</p>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}
