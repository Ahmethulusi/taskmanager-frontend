import { useQuery } from '@tanstack/react-query'

import { getLabels } from '@/modules/labels/api/labelsApi'

export function useLabelsQuery() {
  return useQuery({ queryKey: ['labels'], queryFn: getLabels })
}
