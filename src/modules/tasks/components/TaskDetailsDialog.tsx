import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getPriorityDisplay, getStatusDisplay } from '@/modules/tasks/utils/taskDisplay'
import type { TaskDto } from '@/modules/tasks/utils/types'

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

interface TaskDetailsDialogProps {
  task: TaskDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailsDialog({ task, open, onOpenChange }: TaskDetailsDialogProps) {
  const status = getStatusDisplay(task.status)
  const priority = getPriorityDisplay(task.priority)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Açıklama</dt>
            <dd>{task.description || 'Açıklama yok'}</dd>
          </div>
          <div className="flex gap-6">
            <div>
              <dt className="text-muted-foreground">Durum</dt>
              <dd>{status.label}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Öncelik</dt>
              <dd>{priority.label}</dd>
            </div>
          </div>
          <div>
            <dt className="text-muted-foreground">Departman</dt>
            <dd>{task.departmentName ?? 'Departman yok'}</dd>
          </div>
          <div className="flex gap-6">
            <div>
              <dt className="text-muted-foreground">Oluşturan</dt>
              <dd>{task.createdByUserName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Atanan</dt>
              <dd>{task.assignedToUserName ?? 'Atanmadı'}</dd>
            </div>
          </div>
          <div className="flex gap-6">
            <div>
              <dt className="text-muted-foreground">Oluşturulma</dt>
              <dd>{dateFormatter.format(new Date(task.createdAt))}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Güncellenme</dt>
              <dd>{task.updatedAt ? dateFormatter.format(new Date(task.updatedAt)) : '-'}</dd>
            </div>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  )
}
