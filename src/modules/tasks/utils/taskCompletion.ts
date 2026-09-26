import type { TaskStatusDto } from '@/modules/statuses/utils/types'
import type { TaskDto } from '@/modules/tasks/utils/types'

type StatusCompletionLookup = Pick<TaskStatusDto, 'id' | 'isCompletionStatus'>

export function isTaskCompleted(
  task: TaskDto,
  statuses?: StatusCompletionLookup[]
): boolean {
  if (task.isCompletionStatus) {
    return true
  }

  if (!statuses?.length) {
    return false
  }

  const status = statuses.find((item) => String(item.id) === String(task.statusId))
  return status?.isCompletionStatus === true
}
