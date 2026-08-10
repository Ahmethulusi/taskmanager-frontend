import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createProject } from '@/modules/projects/api/projectsApi'
import type { CreateProjectDto } from '@/modules/projects/utils/types'

export function useCreateProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateProjectDto) => createProject(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
