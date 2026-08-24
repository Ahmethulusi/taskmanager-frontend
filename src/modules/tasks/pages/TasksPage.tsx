import { PageHeader } from '@/components/layout/PageHeader'
import { TaskWorkspace } from '@/modules/tasks/components/TaskWorkspace'

export function TasksPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageHeader title="Görevler" />
      <TaskWorkspace />
    </div>
  )
}
