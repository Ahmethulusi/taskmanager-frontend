import { useQuery } from '@tanstack/react-query'

import { getSprintsForProject } from '@/modules/sprints/api/sprintsApi'

export function useSprintsQuery(projectId: string) {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => getSprintsForProject(projectId),
    enabled: !!projectId,
  })
}
