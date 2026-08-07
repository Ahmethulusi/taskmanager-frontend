import type { TaskDto } from '@/modules/tasks/utils/types'

export type PriorityFilter = 'all' | 'Dusuk' | 'Orta' | 'Yuksek'
export type DateFilter = 'all' | 'today' | 'thisWeek' | 'thisMonth'
export type SortField = 'createdAt' | 'priority' | null
export type SortDirection = 'asc' | 'desc'

const PRIORITY_ORDER: Record<string, number> = {
  Dusuk: 0,
  Orta: 1,
  Yuksek: 2,
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = start.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diffToMonday)
  return start
}

function matchesDateFilter(createdAt: Date, dateFilter: DateFilter, now: Date): boolean {
  switch (dateFilter) {
    case 'all':
      return true
    case 'today':
      return isSameDay(createdAt, now)
    case 'thisWeek': {
      const weekStart = startOfWeek(now)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)
      return createdAt >= weekStart && createdAt < weekEnd
    }
    case 'thisMonth':
      return (
        createdAt.getFullYear() === now.getFullYear() &&
        createdAt.getMonth() === now.getMonth()
      )
  }
}

export function filterAndSortTasks(
  tasks: TaskDto[],
  priorityFilter: PriorityFilter,
  dateFilter: DateFilter,
  sortField: SortField,
  sortDirection: SortDirection
): TaskDto[] {
  const now = new Date()

  const filtered = tasks.filter((task) => {
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false
    }
    return matchesDateFilter(new Date(task.createdAt), dateFilter, now)
  })

  if (!sortField) {
    return filtered
  }

  const direction = sortDirection === 'asc' ? 1 : -1
  return [...filtered].sort((a, b) => {
    if (sortField === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction
    }
    const aOrder = PRIORITY_ORDER[a.priority] ?? -1
    const bOrder = PRIORITY_ORDER[b.priority] ?? -1
    return (aOrder - bOrder) * direction
  })
}
