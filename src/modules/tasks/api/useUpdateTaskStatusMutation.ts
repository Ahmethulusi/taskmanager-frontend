import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateTaskStatus } from '@/modules/tasks/api/tasksApi'

interface UpdateTaskStatusVariables {
  taskId: string
  status: string
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, status }: UpdateTaskStatusVariables) => updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
