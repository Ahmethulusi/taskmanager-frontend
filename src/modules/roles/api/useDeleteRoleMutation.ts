import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteRole } from '@/modules/roles/api/rolesApi'

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
