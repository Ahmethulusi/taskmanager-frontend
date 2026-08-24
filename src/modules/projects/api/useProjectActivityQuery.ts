import { useQuery } from '@tanstack/react-query'

import { getProjectActivity } from '@/modules/projects/api/projectsApi'

export function useProjectActivityQuery(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'activity'],
    queryFn: () => getProjectActivity(projectId),
    enabled: !!projectId,
  })
}
