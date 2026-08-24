import { toDateKey } from '@/modules/tasks/utils/calendarDates'
import type { TaskDto } from '@/modules/tasks/utils/types'

export function groupTasksByDueDate(tasks: TaskDto[]): Record<string, TaskDto[]> {
  return tasks.reduce<Record<string, TaskDto[]>>((groups, task) => {
    if (!task.dueDate) return groups

    const dueDate = new Date(task.dueDate)
    if (Number.isNaN(dueDate.getTime())) return groups

    const key = toDateKey(dueDate)
    ;(groups[key] ??= []).push(task)
    return groups
  }, {})
}
