import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateTaskLabels } from '@/modules/tasks/api/tasksApi'

interface UpdateTaskLabelsVariables {
  taskId: string
  labelIds: string[]
}

export function useUpdateTaskLabelsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, labelIds }: UpdateTaskLabelsVariables) =>
      updateTaskLabels(taskId, labelIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
