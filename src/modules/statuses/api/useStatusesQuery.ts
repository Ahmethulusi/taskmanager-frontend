import { useQuery } from '@tanstack/react-query'

import { getStatuses } from '@/modules/statuses/api/statusesApi'

export function useStatusesQuery() {
  return useQuery({ queryKey: ['statuses'], queryFn: getStatuses })
}
