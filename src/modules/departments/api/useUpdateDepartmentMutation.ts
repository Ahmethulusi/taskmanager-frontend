import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateDepartment } from '@/modules/departments/api/departmentsApi'

interface UpdateDepartmentVariables {
  id: string
  name: string
  userIds: string[]
  managerId: string | null
}

export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name, userIds, managerId }: UpdateDepartmentVariables) =>
      updateDepartment(id, name, userIds, managerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
