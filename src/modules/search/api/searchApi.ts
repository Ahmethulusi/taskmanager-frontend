import { apiFetch } from '@/lib/apiClient'
import type { SearchResultsDto } from '@/modules/search/utils/types'

export function search(query: string): Promise<SearchResultsDto> {
  return apiFetch<SearchResultsDto>(`/api/search?q=${encodeURIComponent(query)}`)
}
