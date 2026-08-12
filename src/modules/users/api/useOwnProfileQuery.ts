import { useQuery } from '@tanstack/react-query'

import { getOwnProfile } from '@/modules/users/api/usersApi'

export function useOwnProfileQuery() {
  return useQuery({ queryKey: ['users', 'me'], queryFn: getOwnProfile })
}
