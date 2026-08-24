import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createSprint } from '@/modules/sprints/api/sprintsApi'
import type { CreateSprintDto } from '@/modules/sprints/utils/types'

interface CreateSprintVariables {
  projectId: string
  dto: CreateSprintDto
}

export function useCreateSprintMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, dto }: CreateSprintVariables) => createSprint(projectId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sprints', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
