import { useDroppable } from '@dnd-kit/core'

import { getStatusColor } from '@/lib/statusColors'
import { cn } from '@/lib/utils'
import { TaskCard } from '@/modules/tasks/components/TaskCard'
import type { TaskDto } from '@/modules/tasks/utils/types'

interface TaskColumnProps {
  statusId: string
  label: string
  colorKey: string
  tasks: TaskDto[]
}

export function TaskColumn({ statusId, label, colorKey, tasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: statusId })
  const color = getStatusColor(colorKey)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full min-h-0 flex-col rounded-lg border border-dashed p-4 shadow-[0_12px_20px_-14px_rgb(0_0_0/0.45)]',
        isOver && 'border-solid border-primary/50 bg-primary/5'
      )}
      style={{
        backgroundColor: isOver ? undefined : color.bg,
        borderColor: isOver ? undefined : `${color.dot}66`,
      }}
    >
      <div className="mb-4 flex shrink-0 items-center gap-2 font-heading text-base font-medium">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color.dot }}
        />
        {label} ({tasks.length})
      </div>
      {/*
        overflow-y-auto clips children; keep padding >= card border width so
        top/side borders stay visible (especially during dnd compositing).
      */}
      <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden p-1">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bu durumda görev yok</p>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}
