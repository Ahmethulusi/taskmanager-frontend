import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateRole } from '@/modules/roles/api/rolesApi'
import type { UpdateRoleDto } from '@/modules/roles/utils/types'

interface UpdateRoleVariables {
  id: string
  dto: UpdateRoleDto
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: UpdateRoleVariables) => updateRole(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
