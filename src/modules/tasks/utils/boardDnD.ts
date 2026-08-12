import type { TaskDto } from '@/modules/tasks/utils/types'
import type { TaskStatusDto } from '@/modules/statuses/utils/types'

export type BoardItems = Record<string, string[]>

export function buildBoardItems(tasks: TaskDto[], statuses: TaskStatusDto[]): BoardItems {
  const items: BoardItems = {}
  for (const status of statuses) {
    items[String(status.id)] = []
  }

  for (const task of tasks) {
    const statusId = String(task.statusId)
    if (!items[statusId]) {
      items[statusId] = []
    }
    items[statusId].push(String(task.id))
  }

  return items
}

export function findBoardContainer(items: BoardItems, id: string): string | undefined {
  if (id in items) {
    return id
  }
  return Object.keys(items).find((containerId) => items[containerId].includes(id))
}

export function reorderTasksByBoardItems(
  tasks: TaskDto[],
  items: BoardItems,
  statuses: TaskStatusDto[]
): TaskDto[] {
  const byId = new Map(tasks.map((task) => [String(task.id), task]))
  const ordered: TaskDto[] = []
  const seen = new Set<string>()

  for (const status of statuses) {
    const statusId = String(status.id)
    for (const taskId of items[statusId] ?? []) {
      const task = byId.get(taskId)
      if (!task || seen.has(taskId)) {
        continue
      }
      ordered.push(task)
      seen.add(taskId)
    }
  }

  for (const task of tasks) {
    const taskId = String(task.id)
    if (!seen.has(taskId)) {
      ordered.push(task)
    }
  }

  return ordered
}
