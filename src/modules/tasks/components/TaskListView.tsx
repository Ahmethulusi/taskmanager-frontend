import { useState } from 'react'
import {
  AlertCircle,
  Calendar,
  Clock,
  CornerDownRight,
  Lock,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { getDueUrgencyDisplay } from '@/modules/tasks/utils/dueUrgencyDisplay'
import { getPriorityDisplay } from '@/modules/tasks/utils/taskDisplay'
import type { TaskDto } from '@/modules/tasks/utils/types'

const PRIORITY_BADGE_CLASSES: Record<string, string> = {
  low: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  unknown: 'bg-muted text-muted-foreground',
}

const dueDateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
})

interface TaskListViewProps {
  tasks: TaskDto[]
}

type OpenDialog = 'edit' | 'delete' | 'assign' | null

export function TaskListView({ tasks }: TaskListViewProps) {
  const { hasPermission } = useAuth()
  const { data: statuses } = useStatusesQuery()
  const { mutate, isPending, error } = useUpdateTaskStatusMutation()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [actionTaskId, setActionTaskId] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const selectedTask = tasks.find((task) => String(task.id) === selectedTaskId) ?? null
  const actionTask = tasks.find((task) => String(task.id) === actionTaskId) ?? null
  const canAssign = hasPermission('tasks.assign')

  if (tasks.length === 0) {
    return <p className="p-4 text-base text-muted-foreground">Görev bulunamadı</p>
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlık</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Öncelik</TableHead>
              <TableHead>Atananlar</TableHead>
              <TableHead>Proje</TableHead>
              <TableHead>Departman</TableHead>
              <TableHead>Etiketler</TableHead>
              <TableHead>Bitiş Tarihi</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">İşlemler</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const priority = getPriorityDisplay(task.priority)
              const statusColor = getStatusColor(task.statusColorKey)
              const isSubtask = task.parentTaskId != null
              const dueUrgency = !task.isOverdue ? getDueUrgencyDisplay(task.dueUrgency) : null

              return (
                <TableRow
                  key={String(task.id)}
                  className="cursor-pointer"
                  onClick={() => setSelectedTaskId(String(task.id))}
                >
                  <TableCell>
                    <div className="flex min-w-0 max-w-72 items-center gap-1.5">
                      {isSubtask && (
                        <CornerDownRight
                          className="size-4 shrink-0"
                          style={{ color: statusColor.dot }}
                          aria-hidden
                        />
                      )}
                      <span className="truncate font-medium">{task.title}</span>
                      {task.isBlocked && (
                        <Lock
                          className="size-3.5 shrink-0 text-orange-600"
                          aria-label="Görev engellenmiş"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: statusColor.dot }}
                      />
                      {task.statusName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('h-6 text-sm', PRIORITY_BADGE_CLASSES[priority.variant])}>
                      {priority.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                      <span className="text-muted-foreground">Atanmadı</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="truncate">{task.projectName ?? '—'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="truncate">{task.departmentName ?? '—'}</span>
                  </TableCell>
                  <TableCell>
                    {task.labels?.length ? (
                      <div className="flex items-center gap-1" title={task.labels.map((l) => l.name).join(', ')}>
                        {task.labels.map((label) => {
                          const color = getLabelColor(String(label.id))
                          return (
                            <span
                              key={String(label.id)}
                              className="size-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: color.text }}
                              title={label.name}
                            />
                          )
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      <div
                        className={cn(
                          'flex items-center gap-1 text-muted-foreground',
                          task.isOverdue && 'text-destructive'
                        )}
                        style={dueUrgency ? { color: dueUrgency.color } : undefined}
                      >
                        <Calendar className="size-3.5 shrink-0" />
                        <span>{dueDateFormatter.format(new Date(task.dueDate))}</span>
                        {task.isOverdue && (
                          <AlertCircle className="size-3.5 shrink-0" aria-label="Gecikmiş" />
                        )}
                        {dueUrgency && (
                          <Clock className="size-3.5 shrink-0" aria-label={dueUrgency.label} />
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer"
                            onClick={(event) => {
                              event.stopPropagation()
                              setActionTaskId(String(task.id))
                            }}
                          />
                        }
                      >
                        <MoreVertical className="size-5" />
                        <span className="sr-only">Görev menüsü</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setActionTaskId(String(task.id))
                            setOpenDialog('edit')
                          }}
                        >
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Durum Değiştir</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {(statuses?.filter(
                              (status) => String(status.id) !== String(task.statusId)
                            ) ?? []).map((status) => (
                              <DropdownMenuItem
                                key={String(status.id)}
                                disabled={isPending}
                                onClick={() =>
                                  mutate({
                                    taskId: String(task.id),
                                    statusId: String(status.id),
                                  })
                                }
                              >
                                {status.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        {canAssign && (
                          <DropdownMenuItem
                            onClick={() => {
                              setActionTaskId(String(task.id))
                              setOpenDialog('assign')
                            }}
                          >
                            Ata
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            setActionTaskId(String(task.id))
                            setOpenDialog('delete')
                          }}
                        >
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {error && (
        <p className="text-xs text-destructive">
          {error instanceof Error ? error.message : 'Durum güncellenemedi'}
        </p>
      )}

      {selectedTask && (
        <TaskDetailsDialog
          task={selectedTask}
          open
          onOpenChange={(open) => {
            if (!open) setSelectedTaskId(null)
          }}
        />
      )}
      {actionTask && (
        <>
          <TaskFormDialog
            mode="edit"
            task={actionTask}
            open={openDialog === 'edit'}
            onOpenChange={(open) => setOpenDialog(open ? 'edit' : null)}
          />
          <DeleteTaskDialog
            taskId={actionTask.id}
            open={openDialog === 'delete'}
            onOpenChange={(open) => setOpenDialog(open ? 'delete' : null)}
          />
          {canAssign && (
            <AssignTaskDialog
              task={actionTask}
              open={openDialog === 'assign'}
              onOpenChange={(open) => setOpenDialog(open ? 'assign' : null)}
            />
          )}
        </>
      )}
    </>
  )
}
