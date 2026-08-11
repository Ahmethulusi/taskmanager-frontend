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
import type { TaskStatusDto } from '@/modules/statuses/utils/types'
import type { TaskDto } from '@/modules/tasks/utils/types'

interface TaskBoardViewProps {
  tasks: TaskDto[]
  statuses: TaskStatusDto[]
}

export function TaskBoardView({ tasks, statuses }: TaskBoardViewProps) {
  const { mutate } = useUpdateTaskStatusMutation()
  const [error, setError] = useState<string | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const activeTask = tasks.find((task) => String(task.id) === activeTaskId) ?? null

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTaskId(null)

    const { active, over } = event
    if (!over) {
      return
    }

    const fromStatusId = active.data.current?.statusId
    const toStatusId = String(over.id)
    if (toStatusId === String(fromStatusId)) {
      return
    }

    setError(null)
    mutate(
      { taskId: String(active.id), statusId: toStatusId },
      {
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Durum güncellenemedi')
        },
      }
    )
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      {error && <p className="mb-2 shrink-0 text-sm text-destructive">{error}</p>}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTaskId(null)}
      >
        <div className="no-scrollbar min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain">
          <div className="grid h-full w-max auto-cols-[17.5rem] grid-flow-col gap-4 p-1 pb-2">
            {statuses.map((status) => (
              <TaskColumn
                key={String(status.id)}
                statusId={String(status.id)}
                label={status.name}
                colorKey={status.colorKey}
                tasks={tasks.filter((task) => String(task.statusId) === String(status.id))}
              />
            ))}
          </div>
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask && <TaskCardDragOverlay task={activeTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
