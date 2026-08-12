import { useQuery } from '@tanstack/react-query'

import { getPermissions } from '@/modules/roles/api/rolesApi'

export function usePermissionsQuery() {
  return useQuery({ queryKey: ['permissions'], queryFn: getPermissions })
}
