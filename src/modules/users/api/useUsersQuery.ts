import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/lib/AuthContext'
import { getUsers } from '@/modules/users/api/usersApi'

export function useUsersQuery() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: user?.role === 'Admin',
  })
}
