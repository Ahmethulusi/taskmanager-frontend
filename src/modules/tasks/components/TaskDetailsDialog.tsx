import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getLabelColor } from '@/lib/labelColors'
import { getStatusColor } from '@/lib/statusColors'
import { getPriorityDisplay } from '@/modules/tasks/utils/taskDisplay'
import type { TaskDto } from '@/modules/tasks/utils/types'

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const dueDateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

interface TaskDetailsDialogProps {
  task: TaskDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailsDialog({ task, open, onOpenChange }: TaskDetailsDialogProps) {
  const priority = getPriorityDisplay(task.priority)
  const statusColor = getStatusColor(task.statusColorKey)

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
              <dd className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: statusColor.dot }}
                />
                {task.statusName}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Öncelik</dt>
              <dd>{priority.label}</dd>
            </div>
          </div>
          <div className="flex gap-6">
            <div>
              <dt className="text-muted-foreground">Departman</dt>
              <dd>{task.departmentName ?? 'Departman yok'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Proje</dt>
              <dd>{task.projectName ?? '—'}</dd>
            </div>
          </div>
          <div>
            <dt className="text-muted-foreground">Bitiş Tarihi</dt>
            <dd>
              {task.dueDate ? dueDateFormatter.format(new Date(task.dueDate)) : 'Belirtilmedi'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Etiketler</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {task.labels?.length ? (
                task.labels.map((label) => {
                  const color = getLabelColor(String(label.id))
                  return (
                    <Badge
                      key={String(label.id)}
                      variant="secondary"
                      className="border-transparent"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      {label.name}
                    </Badge>
                  )
                })
              ) : (
                <span>Etiket yok</span>
              )}
            </dd>
          </div>
          <div className="flex gap-6">
            <div>
              <dt className="text-muted-foreground">Oluşturan</dt>
              <dd>{task.createdByUserName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Atanan</dt>
              <dd>
                {task.assignedUsers?.length
                  ? task.assignedUsers.map((user) => user.fullName).join(', ')
                  : 'Atanmadı'}
              </dd>
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
