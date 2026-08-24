import type { TaskDto } from '@/modules/tasks/utils/types'

export interface ProjectStats {
  totalCount: number
  completedCount: number
  overdueCount: number
  progressPercentage: number
}

export function computeProjectStats(projectId: string, allTasks: TaskDto[]): ProjectStats {
  const tasks = allTasks.filter((task) => String(task.projectId) === String(projectId))
  const totalCount = tasks.length
  const completedCount = tasks.filter((task) => task.isCompletionStatus).length
  const overdueCount = tasks.filter((task) => task.isOverdue).length
  const progressPercentage =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  return { totalCount, completedCount, overdueCount, progressPercentage }
}
