import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getStatusColor } from '@/lib/statusColors'
import { TaskFormDialog } from '@/modules/tasks/components/TaskFormDialog'
import type { TaskDto } from '@/modules/tasks/utils/types'

interface SubtasksSectionProps {
  task: TaskDto
}

export function SubtasksSection({ task }: SubtasksSectionProps) {
  const navigate = useNavigate()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const progress = task.subtaskProgress
  const progressValue =
    progress && progress.totalCount > 0
      ? (progress.completedCount / progress.totalCount) * 100
      : 0

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-sm font-medium">Alt Görevler</h3>
        {task.parentTaskId === null && (
          <Button type="button" variant="outline" size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus />
            Alt Görev Ekle
          </Button>
        )}
      </div>

      {progress && (
        <div className="flex items-center gap-3">
          <Progress value={progressValue} className="min-w-0 flex-1" />
          <span className="shrink-0 text-xs text-muted-foreground">
            {progress.completedCount}/{progress.totalCount} tamamlandı
          </span>
        </div>
      )}

      {task.subtasks.length > 0 ? (
        <ul className="space-y-1.5">
          {task.subtasks.map((subtask) => {
            const statusColor = getStatusColor(subtask.statusColorKey)
            return (
              <li key={subtask.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors hover:bg-muted"
                  onClick={() => navigate(`/tasks/${subtask.id}`)}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: statusColor.dot }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {subtask.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {subtask.statusName}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Henüz alt görev yok</p>
      )}

      <TaskFormDialog
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultParentTaskId={Number(task.id)}
        defaultProjectId={task.projectId ?? undefined}
        defaultDepartmentId={task.departmentId ?? undefined}
        defaultAssignedUserIds={task.assignedUsers?.map((assigned) => String(assigned.id)) ?? []}
      />
    </section>
  )
}
