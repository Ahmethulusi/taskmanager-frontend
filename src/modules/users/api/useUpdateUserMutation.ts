import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateUser } from '@/modules/users/api/usersApi'
import type { UpdateUserDto } from '@/modules/users/utils/types'

interface UpdateUserVariables {
  id: string
  dto: UpdateUserDto
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: UpdateUserVariables) => updateUser(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}
