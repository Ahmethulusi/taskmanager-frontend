import { createElement } from 'react'
import { useParams } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getProjectColor } from '@/lib/projectColors'
import { getProjectIcon } from '@/lib/projectIcons'
import { ProjectMembersTab } from '@/modules/projects/components/ProjectMembersTab'
import { ProjectOverviewTab } from '@/modules/projects/components/ProjectOverviewTab'
import { useProjectQuery } from '@/modules/projects/api/useProjectQuery'
import { TaskWorkspace } from '@/modules/tasks/components/TaskWorkspace'
import { useTasksQuery } from '@/modules/tasks/api/useTasksQuery'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: project, isLoading, isError, error } = useProjectQuery(id ?? '')
  const { data: tasks } = useTasksQuery()

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <PageHeader title="Proje" />
        <p className="p-4 text-base">Yükleniyor...</p>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <PageHeader title="Proje" />
        <p className="p-4 text-base text-destructive">
          {error instanceof Error ? error.message : 'Bu projeye erişiminiz yok ya da proje bulunamadı'}
        </p>
      </div>
    )
  }

  const color = getProjectColor(project.id)
  const projectTasks = (tasks ?? []).filter((task) => String(task.projectId) === String(project.id))

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageHeader title="Proje" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <div className="flex shrink-0 items-start gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: color.bg }}
          >
            {createElement(getProjectIcon(project.iconKey), {
              className: 'size-6',
              style: { color: color.accent },
            })}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="truncate font-heading text-2xl font-bold">{project.name}</h2>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>

        <Tabs
          defaultValue="overview"
          className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <TabsList className="shrink-0">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="tasks">Görevler</TabsTrigger>
            <TabsTrigger value="members">Üyeler</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" keepMounted className="min-h-0 flex-1 overflow-y-auto">
            <ProjectOverviewTab project={project} tasks={projectTasks} />
          </TabsContent>

          <TabsContent
            value="tasks"
            keepMounted
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <TaskWorkspace fixedProjectId={project.id} />
          </TabsContent>

          <TabsContent value="members" keepMounted className="min-h-0 flex-1 overflow-y-auto">
            <ProjectMembersTab project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
