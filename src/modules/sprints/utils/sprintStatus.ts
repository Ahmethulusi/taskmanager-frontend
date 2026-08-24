import type { SprintDto } from '@/modules/sprints/utils/types'

export type SprintStatus = 'upcoming' | 'active' | 'completed'

export function getSprintStatus(sprint: SprintDto): SprintStatus {
  const now = new Date()
  const start = new Date(sprint.startDate)
  const end = new Date(sprint.endDate)
  if (now < start) return 'upcoming'
  if (now > end) return 'completed'
  return 'active'
}

export interface SprintStatusDisplay {
  label: string
  className: string
}

const SPRINT_STATUS_DISPLAY: Record<SprintStatus, SprintStatusDisplay> = {
  upcoming: { label: 'Yaklaşan', className: 'bg-muted text-muted-foreground' },
  active: { label: 'Aktif', className: 'bg-primary/10 text-primary' },
  completed: { label: 'Tamamlandı', className: 'bg-green-50 text-green-700' },
}

export function getSprintStatusDisplay(status: SprintStatus): SprintStatusDisplay {
  return SPRINT_STATUS_DISPLAY[status]
}
