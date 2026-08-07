import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createTask, type CreateTaskDto } from '@/modules/tasks/api/tasksApi'

export function useCreateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateTaskDto) => createTask(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
