import type { TaskStatusDto } from '@/modules/statuses/utils/types'
import type { TaskDto } from '@/modules/tasks/utils/types'
import { isTaskCompleted } from '@/modules/tasks/utils/taskCompletion'

export interface SprintStats {
  totalCount: number
  completedCount: number
  overdueCount: number
  progressPercentage: number
}

export function computeSprintStats(
  sprintId: string,
  allTasks: TaskDto[],
  statuses?: Pick<TaskStatusDto, 'id' | 'isCompletionStatus'>[]
): SprintStats {
  const tasks = allTasks.filter((task) => String(task.sprintId) === String(sprintId))
  const totalCount = tasks.length
  const completedCount = tasks.filter((task) => isTaskCompleted(task, statuses)).length
  const overdueCount = tasks.filter((task) => task.isOverdue).length
  const progressPercentage =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  return { totalCount, completedCount, overdueCount, progressPercentage }
}
