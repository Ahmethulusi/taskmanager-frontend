import { useQuery } from '@tanstack/react-query'

import { search } from '@/modules/search/api/searchApi'

export function useSearchQuery(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => search(query),
    enabled: query.length >= 2,
  })
}
