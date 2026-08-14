import { useMutation, useQueryClient } from '@tanstack/react-query'

import { removeDependency } from '@/modules/tasks/api/tasksApi'

interface RemoveDependencyVariables {
  taskId: number
  dependsOnTaskId: number
}

export function useRemoveDependencyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, dependsOnTaskId }: RemoveDependencyVariables) =>
      removeDependency(taskId, dependsOnTaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
