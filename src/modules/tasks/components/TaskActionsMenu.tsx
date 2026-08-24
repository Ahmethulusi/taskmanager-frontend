import { useState } from 'react'
import { MoreVertical } from 'lucide-react'

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
import { useStatusesQuery } from '@/modules/statuses/api/useStatusesQuery'
import { useUpdateTaskStatusMutation } from '@/modules/tasks/api/useUpdateTaskStatusMutation'
import { AssignTaskDialog } from '@/modules/tasks/components/AssignTaskDialog'
import { DeleteTaskDialog } from '@/modules/tasks/components/DeleteTaskDialog'
import { TaskFormDialog } from '@/modules/tasks/components/TaskFormDialog'
import type { TaskDto } from '@/modules/tasks/utils/types'

type OpenDialog = 'edit' | 'delete' | 'assign' | null

interface TaskActionsMenuProps {
  task: TaskDto
  className?: string
  compact?: boolean
}

export function TaskActionsMenu({ task, className, compact = false }: TaskActionsMenuProps) {
  const { hasPermission } = useAuth()
  const { data: statuses } = useStatusesQuery()
  const { mutate, isPending } = useUpdateTaskStatusMutation()
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const canAssign = hasPermission('tasks.assign')
  const otherStatuses =
    statuses?.filter((status) => String(status.id) !== String(task.statusId)) ?? []

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'icon-xs' : 'icon-sm'}
              className={cn('shrink-0 cursor-pointer', className)}
              onClick={(event) => event.stopPropagation()}
            />
          }
        >
          <MoreVertical className={compact ? 'size-3.5' : 'size-5'} />
          <span className="sr-only">Görev menüsü</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
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
