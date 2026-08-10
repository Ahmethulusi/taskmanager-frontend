import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateProject } from '@/modules/projects/api/projectsApi'
import type { UpdateProjectDto } from '@/modules/projects/utils/types'

interface UpdateProjectVariables {
  id: string
  dto: UpdateProjectDto
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: UpdateProjectVariables) => updateProject(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
