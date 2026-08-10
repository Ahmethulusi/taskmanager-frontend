import { useQuery } from '@tanstack/react-query'

import { getProjects } from '@/modules/projects/api/projectsApi'

export function useProjectsQuery() {
  return useQuery({ queryKey: ['projects'], queryFn: getProjects })
}
