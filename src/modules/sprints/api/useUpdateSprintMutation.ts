import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateSprint } from '@/modules/sprints/api/sprintsApi'
import type { UpdateSprintDto } from '@/modules/sprints/utils/types'

interface UpdateSprintVariables {
  id: string
  projectId: string
  dto: UpdateSprintDto
}

export function useUpdateSprintMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: UpdateSprintVariables) => updateSprint(id, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sprints', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
