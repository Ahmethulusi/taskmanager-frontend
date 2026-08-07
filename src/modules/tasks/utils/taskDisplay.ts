export interface TaskDisplayInfo {
  label: string
  variant: string
}

const STATUS_DISPLAY: Record<string, TaskDisplayInfo> = {
  Bekliyor: { label: 'Bekliyor', variant: 'pending' },
  DevamEdiyor: { label: 'Devam Ediyor', variant: 'in-progress' },
  Tamamlandi: { label: 'Tamamlandı', variant: 'done' },
}

const PRIORITY_DISPLAY: Record<string, TaskDisplayInfo> = {
  Dusuk: { label: 'Düşük', variant: 'low' },
  Orta: { label: 'Orta', variant: 'medium' },
  Yuksek: { label: 'Yüksek', variant: 'high' },
}

export function getStatusDisplay(status: string): TaskDisplayInfo {
  return STATUS_DISPLAY[status] ?? { label: status, variant: 'unknown' }
}

export function getPriorityDisplay(priority: string): TaskDisplayInfo {
  return PRIORITY_DISPLAY[priority] ?? { label: priority, variant: 'unknown' }
}
