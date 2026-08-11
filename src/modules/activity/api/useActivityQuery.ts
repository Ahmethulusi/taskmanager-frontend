import { useQuery } from '@tanstack/react-query'

import { getActivity } from '@/modules/activity/api/activityApi'

export function useActivityQuery(taskId: string) {
  return useQuery({
    queryKey: ['activity', taskId],
    queryFn: () => getActivity(taskId),
    enabled: !!taskId,
  })
}
