import { useQuery } from '@tanstack/react-query'

import { getProject } from '@/modules/projects/api/projectsApi'

export function useProjectQuery(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
    retry: false,
  })
}
