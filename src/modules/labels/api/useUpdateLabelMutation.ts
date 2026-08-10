import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateLabel } from '@/modules/labels/api/labelsApi'
import type { UpdateLabelDto } from '@/modules/labels/utils/types'

interface UpdateLabelVariables {
  id: string
  dto: UpdateLabelDto
}

export function useUpdateLabelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: UpdateLabelVariables) => updateLabel(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] })
    },
  })
}
