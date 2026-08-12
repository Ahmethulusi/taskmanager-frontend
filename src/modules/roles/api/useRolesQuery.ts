import { useQuery } from '@tanstack/react-query'

import { getRoles } from '@/modules/roles/api/rolesApi'

export function useRolesQuery() {
  return useQuery({ queryKey: ['roles'], queryFn: getRoles })
}
