import { useMutation, useQueryClient } from '@tanstack/react-query'

import { addDependency } from '@/modules/tasks/api/tasksApi'

interface AddDependencyVariables {
  taskId: number
  dependsOnTaskId: number
}

export function useAddDependencyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, dependsOnTaskId }: AddDependencyVariables) =>
      addDependency(taskId, dependsOnTaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
