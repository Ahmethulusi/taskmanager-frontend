export interface TaskDisplayInfo {
  label: string
  variant: string
}

const PRIORITY_DISPLAY: Record<string, TaskDisplayInfo> = {
  Dusuk: { label: 'Düşük', variant: 'low' },
  Orta: { label: 'Orta', variant: 'medium' },
  Yuksek: { label: 'Yüksek', variant: 'high' },
}

export function getPriorityDisplay(priority: string): TaskDisplayInfo {
  return PRIORITY_DISPLAY[priority] ?? { label: priority, variant: 'unknown' }
}
