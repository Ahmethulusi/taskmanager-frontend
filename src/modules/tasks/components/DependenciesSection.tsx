import { useState } from 'react'
import { Clock3, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getStatusColor } from '@/lib/statusColors'
import { useAddDependencyMutation } from '@/modules/tasks/api/useAddDependencyMutation'
import { useRemoveDependencyMutation } from '@/modules/tasks/api/useRemoveDependencyMutation'
import { TaskPicker } from '@/modules/tasks/components/TaskPicker'
import type { TaskDto, TaskRelationshipSummary } from '@/modules/tasks/utils/types'

interface DependenciesSectionProps {
  task: TaskDto
}

export function DependenciesSection({ task }: DependenciesSectionProps) {
  const addMutation = useAddDependencyMutation()
  const removeMutation = useRemoveDependencyMutation()
  const [error, setError] = useState<string | null>(null)
  const taskId = Number(task.id)

  async function addDependency(dependsOnTaskId: number) {
    setError(null)
    try {
      await addMutation.mutateAsync({ taskId, dependsOnTaskId })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bağımlılık eklenemedi')
    }
  }

  async function removeDependency(ownerTaskId: number, dependsOnTaskId: number) {
    setError(null)
    try {
      await removeMutation.mutateAsync({ taskId: ownerTaskId, dependsOnTaskId })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bağımlılık kaldırılamadı')
    }
  }

  return (
    <section className="space-y-5">
      <DependencyGroup
        title="Bu görev şunları bekliyor"
        emptyMessage="Bu görevin beklediği görev yok"
        items={task.blockedBy}
        disabled={removeMutation.isPending}
        onRemove={(item) => void removeDependency(taskId, item.taskId)}
      />

      <TaskPicker
        excludeTaskIds={[taskId, ...task.blockedBy.map((item) => item.taskId)]}
        onSelect={(selectedTask) => void addDependency(Number(selectedTask.id))}
      />

      <DependencyGroup
        title="Bu görevi şunlar bekliyor"
        emptyMessage="Bu görevi bekleyen görev yok"
        items={task.blocks}
        disabled={removeMutation.isPending}
        onRemove={(item) => void removeDependency(item.taskId, taskId)}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  )
}

interface DependencyGroupProps {
  title: string
  emptyMessage: string
  items: TaskRelationshipSummary[]
  disabled: boolean
  onRemove: (item: TaskRelationshipSummary) => void
}

function DependencyGroup({
  title,
  emptyMessage,
  items,
  disabled,
  onRemove,
}: DependencyGroupProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-heading text-sm font-medium">{title}</h3>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item) => {
            const statusColor = getStatusColor(item.statusColorKey)
            return (
              <li
                key={item.taskId}
                className="flex items-center gap-2 rounded-md border px-3 py-2"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: statusColor.dot }}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {item.taskTitle}
                </span>
                {!item.isCompletionStatus && (
                  <Clock3 className="size-3.5 shrink-0 text-orange-600" aria-label="Beklemede" />
                )}
                <span className="shrink-0 text-xs text-muted-foreground">{item.statusName}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={disabled}
                  onClick={() => onRemove(item)}
                >
                  <X />
                  <span className="sr-only">Bağımlılığı kaldır</span>
                </Button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </div>
  )
}
