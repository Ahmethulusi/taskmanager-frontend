import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateTaskStatus } from '@/modules/tasks/api/tasksApi'
import type { TaskStatusDto } from '@/modules/statuses/utils/types'
import type { TaskDto } from '@/modules/tasks/utils/types'

interface UpdateTaskStatusVariables {
  taskId: string
  statusId: string
  /** 0-based index inside the target column. Appends when omitted. */
  toIndex?: number
}

function moveTaskInList(
  tasks: TaskDto[],
  taskId: string,
  statusId: string,
  statusMeta: Pick<TaskDto, 'statusName' | 'statusColorKey'>,
  toIndex?: number
): TaskDto[] {
  const moving = tasks.find((task) => String(task.id) === String(taskId))
  if (!moving) {
    return tasks
  }

  const without = tasks.filter((task) => String(task.id) !== String(taskId))
  const updated: TaskDto = {
    ...moving,
    statusId: String(statusId),
    statusName: statusMeta.statusName,
    statusColorKey: statusMeta.statusColorKey,
  }

  if (toIndex === undefined) {
    return [...without, updated]
  }

  const statusTaskIndexes = without
    .map((task, index) => (String(task.statusId) === String(statusId) ? index : -1))
    .filter((index) => index >= 0)

  let insertAt: number
  if (statusTaskIndexes.length === 0 || toIndex <= 0) {
    const firstSame = without.findIndex((task) => String(task.statusId) === String(statusId))
    insertAt = firstSame === -1 ? without.length : firstSame
  } else if (toIndex >= statusTaskIndexes.length) {
    insertAt = statusTaskIndexes[statusTaskIndexes.length - 1] + 1
  } else {
    insertAt = statusTaskIndexes[toIndex]
  }

  const next = [...without]
  next.splice(insertAt, 0, updated)
  return next
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, statusId }: UpdateTaskStatusVariables) =>
      updateTaskStatus(taskId, statusId),
    onMutate: async ({ taskId, statusId, toIndex }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      const previousTasks = queryClient.getQueryData<TaskDto[]>(['tasks'])
      const statuses = queryClient.getQueryData<TaskStatusDto[]>(['statuses'])
      const currentTask = previousTasks?.find((task) => String(task.id) === String(taskId))
      const nextStatus = statuses?.find((status) => String(status.id) === String(statusId))

      queryClient.setQueryData<TaskDto[]>(['tasks'], (current) => {
        if (!current) {
          return current
        }

        return moveTaskInList(
          current,
          taskId,
          statusId,
          {
            statusName: nextStatus?.name ?? currentTask?.statusName ?? '',
            statusColorKey: nextStatus?.colorKey ?? currentTask?.statusColorKey ?? 'gray',
          },
          toIndex
        )
      })

      return { previousTasks }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<TaskDto[]>(['tasks'], (current) => {
        if (!current) {
          return current
        }
        // Preserve optimistic column position; only refresh task fields.
        return current.map((task) =>
          String(task.id) === String(updatedTask.id) ? { ...task, ...updatedTask } : task
        )
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
    },
  })
}
