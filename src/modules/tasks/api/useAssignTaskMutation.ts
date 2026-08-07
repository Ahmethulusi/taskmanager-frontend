import { useMutation, useQueryClient } from '@tanstack/react-query'

import { assignTask } from '@/modules/tasks/api/tasksApi'

interface AssignTaskVariables {
  taskId: string
  assignedToUserId: string | null
}

export function useAssignTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, assignedToUserId }: AssignTaskVariables) => assignTask(taskId, assignedToUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
