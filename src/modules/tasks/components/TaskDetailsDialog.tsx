import type { ReactNode } from 'react'

import { UserAvatar } from '@/components/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { getLabelColor } from '@/lib/labelColors'
import { getStatusColor } from '@/lib/statusColors'
import { ActivityTimeline } from '@/modules/activity/components/ActivityTimeline'
import { getPriorityDisplay } from '@/modules/tasks/utils/taskDisplay'
import type { TaskDto } from '@/modules/tasks/utils/types'

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const dueDateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="h-full gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:w-2/3 data-[side=right]:sm:max-w-none"
      >
        <SheetHeader className="shrink-0 gap-2 border-b px-4 py-3 pr-14">
          <SheetTitle className="text-lg leading-snug">{task.title}</SheetTitle>
          <SheetDescription className="sr-only">Görev detayları ve yorumlar</SheetDescription>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="h-6 gap-1.5 border-transparent text-xs">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: statusColor.dot }}
              />
              {task.statusName}
            </Badge>
            <Badge variant="secondary" className="h-6 text-xs">
              {priority.label}
            </Badge>
          </div>
          {task.description ? (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{task.description}</p>
          ) : null}
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <dl className="grid shrink-0 grid-cols-4 gap-x-2 gap-y-1.5 px-4 py-2.5">
            <DetailField label="Bitiş">
              {task.dueDate ? dueDateFormatter.format(new Date(task.dueDate)) : '—'}
            </DetailField>
            <DetailField label="Departman">{task.departmentName ?? '—'}</DetailField>
            <DetailField label="Proje">{task.projectName ?? '—'}</DetailField>
            <DetailField label="Atananlar">
              {task.assignedUsers?.length ? (
                <ul className="space-y-0.5">
                  {task.assignedUsers.map((user) => (
                    <li key={String(user.id)} className="flex min-w-0 items-center gap-1">
                      <UserAvatar name={user.fullName} size="sm" />
                      <span className="truncate">{user.fullName}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </DetailField>

            <DetailField label="Oluşturan">{task.createdByUserName}</DetailField>
            <DetailField label="Oluşturulma">
              {dateFormatter.format(new Date(task.createdAt))}
            </DetailField>
            <DetailField label="Güncellenme">
              {task.updatedAt ? dateFormatter.format(new Date(task.updatedAt)) : '—'}
            </DetailField>
            <DetailField label="Etiketler">
              {task.labels?.length ? (
                <div className="flex flex-wrap gap-0.5">
                  {task.labels.map((label) => {
                    const color = getLabelColor(String(label.id))
                    return (
                      <Badge
                        key={String(label.id)}
                        variant="secondary"
                        className="h-5 max-w-full truncate border-transparent px-1.5 text-xs"
                        style={{ backgroundColor: color.bg, color: color.text }}
                        title={label.name}
                      >
                        {label.name}
                      </Badge>
                    )
                  })}
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </DetailField>
          </dl>

          <Separator className="shrink-0" />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-3 pb-4">
            <ActivityTimeline taskId={task.id} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface DetailFieldProps {
  label: string
  className?: string
  children: ReactNode
}

function DetailField({ label, className, children }: DetailFieldProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="truncate text-xs leading-none text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm leading-snug">{children}</dd>
    </div>
  )
}
