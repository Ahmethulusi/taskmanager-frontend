import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateOwnProfile } from '@/modules/users/api/usersApi'

interface UpdateOwnProfileVariables {
  fullName: string
  email: string
}

export function useUpdateOwnProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fullName, email }: UpdateOwnProfileVariables) =>
      updateOwnProfile(fullName, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
    },
  })
}
