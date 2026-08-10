import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteDepartment } from '@/modules/departments/api/departmentsApi'

export function useDeleteDepartmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
