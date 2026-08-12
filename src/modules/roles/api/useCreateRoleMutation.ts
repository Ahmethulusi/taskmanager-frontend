import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createRole } from '@/modules/roles/api/rolesApi'
import type { CreateRoleDto } from '@/modules/roles/utils/types'

export function useCreateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateRoleDto) => createRole(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
