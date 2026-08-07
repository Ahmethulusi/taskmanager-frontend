import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAssignTaskMutation } from '@/modules/tasks/api/useAssignTaskMutation'
import type { TaskDto } from '@/modules/tasks/utils/types'
import { useUsersQuery } from '@/modules/users/api/useUsersQuery'

const UNASSIGNED = 'none'

interface AssignTaskDialogProps {
  task: TaskDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignTaskDialog({ task, open, onOpenChange }: AssignTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Görevi Ata</DialogTitle>
        </DialogHeader>
        {open && <AssignTaskDialogBody task={task} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  )
}

interface AssignTaskDialogBodyProps {
  task: TaskDto
  onOpenChange: (open: boolean) => void
}

function AssignTaskDialogBody({ task, onOpenChange }: AssignTaskDialogBodyProps) {
  const { data: users } = useUsersQuery()
  const { mutate, isPending, error } = useAssignTaskMutation()

  function handleChange(value: string | null) {
    const assignedToUserId = value === UNASSIGNED || value === null ? null : value
    mutate(
      { taskId: task.id, assignedToUserId },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <>
      {error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Atama yapılamadı'}
        </p>
      )}

      <Select
        items={[
          { value: UNASSIGNED, label: 'Atamayı Kaldır' },
          ...(users?.map((u) => ({ value: u.id, label: u.fullName })) ?? []),
        ]}
        value={task.assignedToUserId ?? UNASSIGNED}
        onValueChange={handleChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Kullanıcı seçin" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNASSIGNED}>Atamayı Kaldır</SelectItem>
          {users?.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.fullName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
