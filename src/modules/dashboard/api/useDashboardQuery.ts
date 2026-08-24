import { useQuery } from '@tanstack/react-query'

import { getDashboardSummary } from '@/modules/dashboard/api/dashboardApi'

export function useDashboardQuery() {
  return useQuery({ queryKey: ['dashboard'], queryFn: getDashboardSummary })
}
