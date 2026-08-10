import { useMutation, useQueryClient } from '@tanstack/react-query'

import { assignTask } from '@/modules/tasks/api/tasksApi'

interface AssignTaskVariables {
  taskId: string
  assignedUserIds: string[]
}

export function useAssignTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, assignedUserIds }: AssignTaskVariables) =>
      assignTask(taskId, assignedUserIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
