import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteTask } from '@/modules/tasks/api/tasksApi'

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
