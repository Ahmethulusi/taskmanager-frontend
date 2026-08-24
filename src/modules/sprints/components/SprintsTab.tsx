import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'
import { getCurrentUserId } from '@/lib/currentUser'
import type { ProjectDto } from '@/modules/projects/utils/types'
import { DeleteSprintDialog } from '@/modules/sprints/components/DeleteSprintDialog'
import { SprintBacklogPicker } from '@/modules/sprints/components/SprintBacklogPicker'
import { SprintCard } from '@/modules/sprints/components/SprintCard'
import { SprintFormDialog } from '@/modules/sprints/components/SprintFormDialog'
import { useSprintsQuery } from '@/modules/sprints/api/useSprintsQuery'
import { computeSprintStats } from '@/modules/sprints/utils/sprintStats'
import type { SprintDto } from '@/modules/sprints/utils/types'
import { TaskWorkspace } from '@/modules/tasks/components/TaskWorkspace'
import type { TaskDto } from '@/modules/tasks/utils/types'

type OpenDialog = 'create' | 'edit' | 'delete' | null

interface SprintsTabProps {
  project: ProjectDto
  tasks: TaskDto[]
}

export function SprintsTab({ project, tasks }: SprintsTabProps) {
  const { hasPermission } = useAuth()
  const currentUserId = getCurrentUserId()
  const myMembership = project.members?.find((member) => member.userId === currentUserId)
  const canManage = hasPermission('projects.manage') || myMembership?.role === 'Owner'

  const { data, isLoading, isError, error } = useSprintsQuery(project.id)
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const [selected, setSelected] = useState<SprintDto | null>(null)
  const [activeSprint, setActiveSprint] = useState<SprintDto | null>(null)

  function openCreate() {
    setSelected(null)
    setOpenDialog('create')
  }

  function openEdit(sprint: SprintDto) {
    setSelected(sprint)
    setOpenDialog('edit')
  }

  function openDelete(sprint: SprintDto) {
    setSelected(sprint)
    setOpenDialog('delete')
  }

  if (activeSprint) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-3 p-4 pb-0">
          <button
            type="button"
            onClick={() => setActiveSprint(null)}
            className="text-sm text-primary hover:underline"
          >
            ← Sprint'lere Dön
          </button>
          <SprintBacklogPicker
            projectId={project.id}
            sprintId={activeSprint.id}
            allTasks={tasks}
          />
        </div>
        <TaskWorkspace fixedProjectId={project.id} fixedSprintId={activeSprint.id} />
      </div>
    )
  }

  function renderContent() {
    if (isLoading) {
      return <p className="p-4 text-base">Yükleniyor...</p>
    }

    if (isError) {
      return (
        <p className="p-4 text-base text-destructive">
          {error instanceof Error ? error.message : 'Sprintler yüklenemedi'}
        </p>
      )
    }

    const sprints = data ?? []

    if (sprints.length === 0) {
      return <p className="p-4 text-base text-muted-foreground">Henüz sprint yok</p>
    }

    return (
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {sprints.map((sprint) => (
          <SprintCard
            key={sprint.id}
            sprint={sprint}
            stats={computeSprintStats(sprint.id, tasks)}
            canManage={canManage}
            onClick={() => setActiveSprint(sprint)}
            onEdit={() => openEdit(sprint)}
            onDelete={() => openDelete(sprint)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {canManage && (
        <div className="flex shrink-0 items-center justify-end p-4 pb-0">
          <Button type="button" size="lg" onClick={openCreate}>
            <Plus />
            Yeni Sprint
          </Button>
        </div>
      )}

      {renderContent()}

      <SprintFormDialog
        mode="create"
        projectId={project.id}
        open={openDialog === 'create'}
        onOpenChange={(open) => setOpenDialog(open ? 'create' : null)}
      />
      {selected && (
        <>
          <SprintFormDialog
            mode="edit"
            projectId={project.id}
            sprint={selected}
            open={openDialog === 'edit'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'edit' : null)
              if (!open) setSelected(null)
            }}
          />
          <DeleteSprintDialog
            sprintId={String(selected.id)}
            projectId={project.id}
            open={openDialog === 'delete'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'delete' : null)
              if (!open) setSelected(null)
            }}
          />
        </>
      )}
    </div>
  )
}
