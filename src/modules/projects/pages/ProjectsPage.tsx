import { useState } from 'react'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { useProjectsQuery } from '@/modules/projects/api/useProjectsQuery'
import { DeleteProjectDialog } from '@/modules/projects/components/DeleteProjectDialog'
import { ProjectCard } from '@/modules/projects/components/ProjectCard'
import { ProjectFormDialog } from '@/modules/projects/components/ProjectFormDialog'
import type { ProjectDto } from '@/modules/projects/utils/types'
import { useTasksQuery } from '@/modules/tasks/api/useTasksQuery'

type OpenDialog = 'create' | 'edit' | 'delete' | null

export function ProjectsPage() {
  const { data, isLoading, isError, error } = useProjectsQuery()
  const { data: tasks } = useTasksQuery()
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const [selected, setSelected] = useState<ProjectDto | null>(null)

  function openCreate() {
    setSelected(null)
    setOpenDialog('create')
  }

  function openEdit(project: ProjectDto) {
    setSelected(project)
    setOpenDialog('edit')
  }

  function openDelete(project: ProjectDto) {
    setSelected(project)
    setOpenDialog('delete')
  }

  function getTaskCount(projectId: string): number {
    return tasks?.filter((task) => String(task.projectId) === String(projectId)).length ?? 0
  }

  function renderContent() {
    if (isLoading) {
      return <p className="p-4 text-base">Yükleniyor...</p>
    }

    if (isError) {
      return (
        <p className="p-4 text-base text-destructive">
          {error instanceof Error ? error.message : 'Projeler yüklenemedi'}
        </p>
      )
    }

    const projects = data ?? []

    if (projects.length === 0) {
      return <p className="p-4 text-base text-muted-foreground">Henüz proje yok</p>
    }

    return (
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            taskCount={getTaskCount(project.id)}
            onEdit={() => openEdit(project)}
            onDelete={() => openDelete(project)}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Projeler"
        actions={
          <Button type="button" size="lg" onClick={openCreate}>
            <Plus />
            Yeni Proje
          </Button>
        }
      />

      {renderContent()}

      <ProjectFormDialog
        mode="create"
        open={openDialog === 'create'}
        onOpenChange={(open) => setOpenDialog(open ? 'create' : null)}
      />
      {selected && (
        <>
          <ProjectFormDialog
            mode="edit"
            project={selected}
            open={openDialog === 'edit'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'edit' : null)
              if (!open) setSelected(null)
            }}
          />
          <DeleteProjectDialog
            projectId={String(selected.id)}
            open={openDialog === 'delete'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'delete' : null)
              if (!open) setSelected(null)
            }}
          />
        </>
      )}
    </>
  )
}
