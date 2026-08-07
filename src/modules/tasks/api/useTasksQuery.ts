import { useQuery } from '@tanstack/react-query'

import { getTasks } from '@/modules/tasks/api/tasksApi'

export function useTasksQuery() {
  return useQuery({ queryKey: ['tasks'], queryFn: getTasks })
}
