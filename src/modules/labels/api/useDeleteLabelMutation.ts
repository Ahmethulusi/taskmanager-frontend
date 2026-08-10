import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteLabel } from '@/modules/labels/api/labelsApi'

export function useDeleteLabelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteLabel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] })
    },
  })
}
