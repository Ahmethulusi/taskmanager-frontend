import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createUser } from '@/modules/users/api/usersApi'
import type { CreateUserDto } from '@/modules/users/utils/types'

export function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateUserDto) => createUser(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}
