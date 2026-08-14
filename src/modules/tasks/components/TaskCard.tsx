import { useState, type ReactNode, type CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Calendar,
  CornerDownRight,
  FolderKanban,
  Lock,
  MessageCircle,
  MoreVertical,
} from 'lucide-react'

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
import { getLabelColor } from '@/lib/labelColors'
import { getStatusColor } from '@/lib/statusColors'
import { cn } from '@/lib/utils'
import { useStatusesQuery } from '@/modules/statuses/api/useStatusesQuery'
import { useUpdateTaskStatusMutation } from '@/modules/tasks/api/useUpdateTaskStatusMutation'
import { AssignTaskDialog } from '@/modules/tasks/components/AssignTaskDialog'
import { DeleteTaskDialog } from '@/modules/tasks/components/DeleteTaskDialog'
import { TaskDetailsDialog } from '@/modules/tasks/components/TaskDetailsDialog'
import { TaskFormDialog } from '@/modules/tasks/components/TaskFormDialog'
import { getPriorityDisplay } from '@/modules/tasks/utils/taskDisplay'
import type { TaskDto } from '@/modules/tasks/utils/types'

const PRIORITY_BADGE_CLASSES: Record<string, string> = {
  low: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  unknown: 'bg-muted text-muted-foreground',
}

const TASK_CARD_CLASSES =
  'group relative rounded-md border-2 bg-card p-3 text-card-foreground cursor-grab active:cursor-grabbing'

const dueDateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
})

/** "Kadıköy Şubesi" → "Kadıköy." — yalnızca ilk kelime tam görünür. */
function abbreviateBranchName(name: string): string {
  const [first, ...rest] = name.trim().split(/\s+/).filter(Boolean)
  if (!first) {
    return name
  }
  return rest.length > 0 ? `${first}.` : first
}

function getTaskCardClassName(...extra: Array<string | false | undefined>) {
  return cn(TASK_CARD_CLASSES, ...extra)
}

type OpenDialog = 'details' | 'edit' | 'delete' | 'assign' | null

interface TaskCardProps {
  task: TaskDto
}

export function TaskCard({ task }: TaskCardProps) {
  const { hasPermission } = useAuth()
  const { data: statuses } = useStatusesQuery()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(task.id),
    data: { statusId: String(task.statusId) },
  })
  const { mutate, isPending, error } = useUpdateTaskStatusMutation()
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)

  const otherStatuses =
    statuses?.filter((status) => String(status.id) !== String(task.statusId)) ?? []
  const canAssign = hasPermission('tasks.assign')
  const borderColor = getStatusColor(task.statusColorKey).dot

  const style: CSSProperties = {
    touchAction: 'none',
    borderColor: `${borderColor}73`,
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 220ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.35 : undefined,
    zIndex: isDragging ? 1 : undefined,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={getTaskCardClassName(isDragging && 'shadow-sm')}
      >
        <TaskCardBody
          task={task}
          action={
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer"
                  />
                }
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
                    {otherStatuses.map((status) => (
                      <DropdownMenuItem
                        key={String(status.id)}
                        disabled={isPending}
                        onClick={() =>
                          mutate({ taskId: String(task.id), statusId: String(status.id) })
                        }
                      >
                        {status.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {canAssign && (
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
      {canAssign && (
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
  const borderColor = getStatusColor(task.statusColorKey).dot
  return (
    <div
      className={getTaskCardClassName('cursor-grabbing shadow-lg')}
      style={{ borderColor: `${borderColor}73` }}
    >
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
  const isSubtask = task.parentTaskId != null
  const borderColor = getStatusColor(task.statusColorKey).dot

  return (
    <>
      <div className="flex items-start gap-1">
        {isSubtask && (
          <CornerDownRight
            className="mt-1 size-4 shrink-0"
            style={{ color: borderColor }}
            aria-hidden
          />
        )}
        <p className="min-w-0 flex-1 font-heading text-base font-medium">{task.title}</p>
        {task.isBlocked && (
          <Lock
            className="mt-0.5 size-4 shrink-0 text-orange-600"
            aria-label="Görev engellenmiş"
          />
        )}
        {action}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge className={cn('h-6 text-sm', PRIORITY_BADGE_CLASSES[priority.variant])}>
          {priority.label}
        </Badge>
        {task.labels?.length > 0 && (
          <>
            {task.labels.slice(0, 2).map((label) => {
              const color = getLabelColor(String(label.id))
              return (
                <Badge
                  key={String(label.id)}
                  variant="secondary"
                  className="h-6 max-w-24 truncate border-transparent text-xs"
                  style={{ backgroundColor: color.bg, color: color.text }}
                  title={label.name}
                >
                  {label.name}
                </Badge>
              )
            })}
            {task.labels.length > 2 && (
              <Badge
                variant="secondary"
                className="h-6 border-transparent text-xs text-muted-foreground"
                title={task.labels
                  .slice(2)
                  .map((label) => label.name)
                  .join(', ')}
              >
                …
              </Badge>
            )}
          </>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        {task.assignedUsers?.length ? (
          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar name={task.assignedUsers[0].fullName} size="sm" />
            <span className="truncate">{task.assignedUsers[0].fullName}</span>
            {task.assignedUsers.length > 1 && (
              <span className="shrink-0 text-muted-foreground">
                +{task.assignedUsers.length - 1}
              </span>
            )}
          </div>
        ) : (
          <span>Atanmadı</span>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="size-3.5 shrink-0" />
            <span>{dueDateFormatter.format(new Date(task.dueDate))}</span>
          </div>
        )}
        {task.commentCount > 0 && (
          <div className="flex items-center gap-1">
            <MessageCircle className="size-3.5 shrink-0" />
            <span>{task.commentCount}</span>
          </div>
        )}
      </div>

      {isSubtask && task.parentTaskTitle && (
        <div
          className="mt-2 flex min-w-0 items-center gap-1 text-xs text-muted-foreground"
          title={task.parentTaskTitle}
        >
          <CornerDownRight className="size-3.5 shrink-0 text-indigo-500/80" />
          <span className="truncate">{task.parentTaskTitle}</span>
        </div>
      )}

      {task.projectName && (
        <div className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <FolderKanban className="size-3.5 shrink-0 text-primary/70" />
          <span className="truncate">{task.projectName}</span>
          {task.departmentName && (
            <>
              <span className="h-3 w-px shrink-0 bg-border" aria-hidden />
              <span className="shrink-0" title={task.departmentName}>
                {abbreviateBranchName(task.departmentName)}
              </span>
            </>
          )}
        </div>
      )}
    </>
  )
}
