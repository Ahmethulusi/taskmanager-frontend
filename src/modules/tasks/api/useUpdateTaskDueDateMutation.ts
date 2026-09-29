import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateTask } from '@/modules/tasks/api/tasksApi'
import type { TaskDto } from '@/modules/tasks/utils/types'

interface UpdateTaskDueDateVariables {
  task: TaskDto
  dueDate: string
}

export function useUpdateTaskDueDateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ task, dueDate }: UpdateTaskDueDateVariables) =>
      updateTask(task.id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        departmentId: task.departmentId,
        projectId: task.projectId,
        sprintId: task.sprintId,
        dueDate,
      }),
    onMutate: async ({ task, dueDate }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData<TaskDto[]>(['tasks'])

      queryClient.setQueryData<TaskDto[]>(['tasks'], (current) =>
        current?.map((item) => (String(item.id) === String(task.id) ? { ...item, dueDate } : item))
      )

      return { previousTasks }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
