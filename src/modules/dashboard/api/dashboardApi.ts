import { apiFetch } from '@/lib/apiClient'
import type { DashboardSummaryDto } from '@/modules/dashboard/utils/types'

export function getDashboardSummary(): Promise<DashboardSummaryDto> {
  return apiFetch<DashboardSummaryDto>('/api/dashboard/summary')
}
