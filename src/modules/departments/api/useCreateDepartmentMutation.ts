import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createDepartment } from '@/modules/departments/api/departmentsApi'

interface CreateDepartmentVariables {
  name: string
  userIds: string[]
  managerId: string | null
}

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, userIds, managerId }: CreateDepartmentVariables) =>
      createDepartment(name, userIds, managerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
