import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'

import { useUpdateTaskStatusMutation } from '@/modules/tasks/api/useUpdateTaskStatusMutation'
import { TaskCardDragOverlay } from '@/modules/tasks/components/TaskCard'
import { TaskColumn } from '@/modules/tasks/components/TaskColumn'
import { TASK_COLUMNS } from '@/modules/tasks/utils/columns'
import type { TaskDto } from '@/modules/tasks/utils/types'

interface TaskBoardViewProps {
  tasks: TaskDto[]
}

export function TaskBoardView({ tasks }: TaskBoardViewProps) {
  const { mutate } = useUpdateTaskStatusMutation()
  const [error, setError] = useState<string | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const activeTask = tasks.find((task) => task.id === activeTaskId) ?? null

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTaskId(null)

    const { active, over } = event
    if (!over) {
      return
    }

    const fromStatus = active.data.current?.status
    const toStatus = String(over.id)
    if (toStatus === fromStatus) {
      return
    }

    setError(null)
    mutate(
      { taskId: String(active.id), status: toStatus },
      {
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Durum güncellenemedi')
        },
      }
    )
  }

  return (
    <div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTaskId(null)}
      >
        <div className="flex gap-4">
          {TASK_COLUMNS.map((column) => (
            <TaskColumn
              key={column.status}
              status={column.status}
              label={column.label}
              tasks={tasks.filter((task) => task.status === column.status)}
            />
          ))}
        </div>
        <DragOverlay>{activeTask && <TaskCardDragOverlay task={activeTask} />}</DragOverlay>
      </DndContext>
    </div>
  )
}
