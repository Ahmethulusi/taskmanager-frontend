import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateTaskStatus } from '@/modules/tasks/api/tasksApi'

interface UpdateTaskStatusVariables {
  taskId: string
  statusId: string
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, statusId }: UpdateTaskStatusVariables) =>
      updateTaskStatus(taskId, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
