import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteUser } from '@/modules/users/api/usersApi'

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}
