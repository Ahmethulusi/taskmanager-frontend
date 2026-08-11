import { apiFetch } from '@/lib/apiClient'
import type { ActivityLogDto } from '@/modules/activity/utils/types'

export function getActivity(taskId: string): Promise<ActivityLogDto[]> {
  return apiFetch<ActivityLogDto[]>(`/api/tasks/${taskId}/activity`)
}
