import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateTask } from '@/modules/tasks/api/tasksApi'
import type { TaskDto } from '@/modules/tasks/utils/types'

interface AssignTaskToSprintVariables {
  task: TaskDto
  sprintId: string | null
}

export function useAssignTaskToSprintMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ task, sprintId }: AssignTaskToSprintVariables) =>
      updateTask(task.id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        departmentId: task.departmentId,
        projectId: task.projectId,
        sprintId,
        dueDate: task.dueDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['sprints'] })
    },
  })
}
