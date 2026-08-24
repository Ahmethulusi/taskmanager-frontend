import type { SearchResultType } from '@/modules/search/utils/types'

const STORAGE_KEY = 'recentSearchItems'
const MAX_ITEMS = 5

export interface RecentItem {
  id: string
  title: string
  type: SearchResultType
}

export function getRecentItems(): RecentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as RecentItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addRecentItem(item: RecentItem): void {
  const existing = getRecentItems().filter((recent) => recent.id !== item.id)
  const next = [item, ...existing].slice(0, MAX_ITEMS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}
