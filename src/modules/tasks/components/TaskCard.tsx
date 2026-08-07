import { useState, type ReactNode } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { MoreVertical } from 'lucide-react'

import { UserAvatar } from '@/components/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/AuthContext'
import { cn } from '@/lib/utils'
import { useUpdateTaskStatusMutation } from '@/modules/tasks/api/useUpdateTaskStatusMutation'
import { AssignTaskDialog } from '@/modules/tasks/components/AssignTaskDialog'
import { DeleteTaskDialog } from '@/modules/tasks/components/DeleteTaskDialog'
import { TaskDetailsDialog } from '@/modules/tasks/components/TaskDetailsDialog'
import { TaskFormDialog } from '@/modules/tasks/components/TaskFormDialog'
import { TASK_COLUMNS } from '@/modules/tasks/utils/columns'
import { getPriorityDisplay, getStatusDisplay } from '@/modules/tasks/utils/taskDisplay'
import type { TaskDto } from '@/modules/tasks/utils/types'

const PRIORITY_BADGE_CLASSES: Record<string, string> = {
  low: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  unknown: 'bg-muted text-muted-foreground',
}

const STATUS_BORDER_CLASSES: Record<string, string> = {
  pending: 'border-status-pending-dot/45',
  'in-progress': 'border-status-progress-dot/45',
  done: 'border-status-done-dot/45',
  unknown: 'border-border',
}

const TASK_CARD_CLASSES = 'rounded-md border-2 bg-card p-3 text-card-foreground'

function getTaskCardClassName(status: string, ...extra: Array<string | false | undefined>) {
  return cn(
    TASK_CARD_CLASSES,
    STATUS_BORDER_CLASSES[getStatusDisplay(status).variant],
    ...extra
  )
}

type OpenDialog = 'details' | 'edit' | 'delete' | 'assign' | null

interface TaskCardProps {
  task: TaskDto
}

export function TaskCard({ task }: TaskCardProps) {
  const { user } = useAuth()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status },
  })
  const { mutate, isPending, error } = useUpdateTaskStatusMutation()
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)

  const otherColumns = TASK_COLUMNS.filter((column) => column.status !== task.status)
  const isAdmin = user?.role === 'Admin'

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ touchAction: 'none' }}
        {...listeners}
        {...attributes}
        className={getTaskCardClassName(task.status, isDragging && 'opacity-40')}
      >
        <TaskCardBody
          task={task}
          action={
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button type="button" variant="ghost" size="icon-sm" />}
              >
                <MoreVertical className="size-5" />
                <span className="sr-only">Görev menüsü</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setOpenDialog('details')}>
                  Detayları Görüntüle
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setOpenDialog('edit')}>Düzenle</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Durum Değiştir</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {otherColumns.map((column) => (
                      <DropdownMenuItem
                        key={column.status}
                        disabled={isPending}
                        onClick={() => mutate({ taskId: task.id, status: column.status })}
                      >
                        {column.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => setOpenDialog('assign')}>Ata</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setOpenDialog('delete')}>
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />

        {error && (
          <p className="mt-2 text-xs text-destructive">
            {error instanceof Error ? error.message : 'Durum güncellenemedi'}
          </p>
        )}
      </div>

      <TaskDetailsDialog
        task={task}
        open={openDialog === 'details'}
        onOpenChange={(open) => setOpenDialog(open ? 'details' : null)}
      />
      <TaskFormDialog
        mode="edit"
        task={task}
        open={openDialog === 'edit'}
        onOpenChange={(open) => setOpenDialog(open ? 'edit' : null)}
      />
      <DeleteTaskDialog
        taskId={task.id}
        open={openDialog === 'delete'}
        onOpenChange={(open) => setOpenDialog(open ? 'delete' : null)}
      />
      {isAdmin && (
        <AssignTaskDialog
          task={task}
          open={openDialog === 'assign'}
          onOpenChange={(open) => setOpenDialog(open ? 'assign' : null)}
        />
      )}
    </>
  )
}

export function TaskCardDragOverlay({ task }: TaskCardProps) {
  return (
    <div className={getTaskCardClassName(task.status, 'cursor-grabbing shadow-lg')}>
      <TaskCardBody task={task} />
    </div>
  )
}

interface TaskCardBodyProps {
  task: TaskDto
  action?: ReactNode
}

function TaskCardBody({ task, action }: TaskCardBodyProps) {
  const priority = getPriorityDisplay(task.priority)

  return (
    <>
      <div className="flex items-start justify-between gap-1">
        <p className="font-heading text-base font-medium">{task.title}</p>
        {action}
      </div>

      <Badge className={cn('mt-2 h-6 text-sm', PRIORITY_BADGE_CLASSES[priority.variant])}>
        {priority.label}
      </Badge>

      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        {task.assignedToUserName ? (
          <>
            <UserAvatar name={task.assignedToUserName} size="sm" />
            <span>{task.assignedToUserName}</span>
          </>
        ) : (
          <span>Atanmadı</span>
        )}
      </div>
    </>
  )
}
