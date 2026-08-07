import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateTask, type UpdateTaskDto } from '@/modules/tasks/api/tasksApi'

interface UpdateTaskVariables {
  taskId: string
  dto: UpdateTaskDto
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, dto }: UpdateTaskVariables) => updateTask(taskId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
