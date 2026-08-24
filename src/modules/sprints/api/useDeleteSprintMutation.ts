import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteSprint } from '@/modules/sprints/api/sprintsApi'

interface DeleteSprintVariables {
  id: string
  projectId: string
}

export function useDeleteSprintMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: DeleteSprintVariables) => deleteSprint(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sprints', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
