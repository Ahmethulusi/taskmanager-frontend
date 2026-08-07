import { useQuery } from '@tanstack/react-query'

import { getDepartments } from '@/modules/departments/api/departmentsApi'

export function useDepartmentsQuery() {
  return useQuery({ queryKey: ['departments'], queryFn: getDepartments })
}
