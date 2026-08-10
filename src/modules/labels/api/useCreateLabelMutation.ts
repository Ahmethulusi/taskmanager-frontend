import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createLabel } from '@/modules/labels/api/labelsApi'
import type { CreateLabelDto } from '@/modules/labels/utils/types'

export function useCreateLabelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateLabelDto) => createLabel(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] })
    },
  })
}
