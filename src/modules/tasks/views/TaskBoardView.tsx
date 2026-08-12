import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useQueryClient } from '@tanstack/react-query'

import { useUpdateTaskStatusMutation } from '@/modules/tasks/api/useUpdateTaskStatusMutation'
import { TaskCardDragOverlay } from '@/modules/tasks/components/TaskCard'
import { TaskColumn } from '@/modules/tasks/components/TaskColumn'
import type { TaskStatusDto } from '@/modules/statuses/utils/types'
import {
  buildBoardItems,
  findBoardContainer,
  reorderTasksByBoardItems,
  type BoardItems,
} from '@/modules/tasks/utils/boardDnD'
import type { TaskDto } from '@/modules/tasks/utils/types'

interface TaskBoardViewProps {
  tasks: TaskDto[]
  statuses: TaskStatusDto[]
}

export function TaskBoardView({ tasks, statuses }: TaskBoardViewProps) {
  const queryClient = useQueryClient()
  const { mutate } = useUpdateTaskStatusMutation()
  const [error, setError] = useState<string | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [dragItems, setDragItems] = useState<BoardItems | null>(null)

  const derivedItems = useMemo(() => buildBoardItems(tasks, statuses), [tasks, statuses])
  const items = dragItems ?? derivedItems

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const taskById = useMemo(() => {
    const map = new Map<string, TaskDto>()
    for (const task of tasks) {
      map.set(String(task.id), task)
    }
    return map
  }, [tasks])

  const activeTask = activeTaskId ? (taskById.get(activeTaskId) ?? null) : null

  function handleDragStart(event: DragStartEvent) {
    setError(null)
    setActiveTaskId(String(event.active.id))
    setDragItems(derivedItems)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) {
      return
    }

    const activeId = String(active.id)
    const overId = String(over.id)

    setDragItems((prev) => {
      const currentItems = prev ?? derivedItems
      const activeContainer = findBoardContainer(currentItems, activeId)
      const overContainer = findBoardContainer(currentItems, overId)
      if (!activeContainer || !overContainer || activeContainer === overContainer) {
        return prev
      }

      const activeItems = currentItems[activeContainer]
      const overItems = currentItems[overContainer]
      const activeIndex = activeItems.indexOf(activeId)
      if (activeIndex < 0) {
        return prev
      }

      let newIndex: number
      if (overId in currentItems) {
        newIndex = overItems.length + 1
      } else {
        const overIndex = overItems.indexOf(overId)
        const isBelowOverItem =
          Boolean(active.rect.current.translated) &&
          (active.rect.current.translated?.top ?? 0) > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
      }

      return {
        ...currentItems,
        [activeContainer]: activeItems.filter((id) => id !== activeId),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          activeId,
          ...overItems.slice(newIndex),
        ],
      }
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const activeId = String(active.id)
    const currentItems = dragItems ?? derivedItems

    setActiveTaskId(null)
    setDragItems(null)

    if (!over) {
      return
    }

    const overId = String(over.id)
    const activeContainer = findBoardContainer(currentItems, activeId)
    const overContainer = findBoardContainer(currentItems, overId)
    if (!activeContainer || !overContainer) {
      return
    }

    const activeIndex = currentItems[activeContainer].indexOf(activeId)
    const overIndex =
      overId in currentItems
        ? Math.max(currentItems[overContainer].length - 1, 0)
        : currentItems[overContainer].indexOf(overId)

    let nextItems = currentItems
    if (activeContainer === overContainer && activeIndex !== overIndex && overIndex >= 0) {
      nextItems = {
        ...currentItems,
        [overContainer]: arrayMove(currentItems[overContainer], activeIndex, overIndex),
      }
    }

    const fromStatusId = String(active.data.current?.statusId ?? activeContainer)
    const toStatusId = overContainer
    const toIndex = nextItems[toStatusId].indexOf(activeId)

    commitBoardOrder(nextItems)

    if (fromStatusId !== toStatusId) {
      mutate(
        { taskId: activeId, statusId: toStatusId, toIndex },
        {
          onError: (err) => {
            setError(err instanceof Error ? err.message : 'Durum güncellenemedi')
          },
        }
      )
    }
  }

  function handleDragCancel() {
    setActiveTaskId(null)
    setDragItems(null)
  }

  function commitBoardOrder(nextItems: BoardItems) {
    queryClient.setQueryData<TaskDto[]>(['tasks'], (current) => {
      if (!current) {
        return current
      }
      return reorderTasksByBoardItems(current, nextItems, statuses)
    })
  }

  function getColumnTasks(statusId: string): TaskDto[] {
    return (items[statusId] ?? [])
      .map((id) => taskById.get(id))
      .filter((task): task is TaskDto => Boolean(task))
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      {error && <p className="mb-2 shrink-0 text-sm text-destructive">{error}</p>}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="no-scrollbar min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain">
          <div className="grid h-full w-max auto-cols-[17.5rem] grid-flow-col gap-4 p-1 pb-2">
            {statuses.map((status) => {
              const statusId = String(status.id)
              return (
                <TaskColumn
                  key={statusId}
                  statusId={statusId}
                  label={status.name}
                  colorKey={status.colorKey}
                  taskIds={items[statusId] ?? []}
                  tasks={getColumnTasks(statusId)}
                />
              )
            })}
          </div>
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask && <TaskCardDragOverlay task={activeTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
