import { useState, type FormEvent } from 'react'

import { MultiSelectCheckList } from '@/components/shared/MultiSelectCheckList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useDepartmentsQuery } from '@/modules/departments/api/useDepartmentsQuery'
import { useProjectsQuery } from '@/modules/projects/api/useProjectsQuery'
import { useAssignTaskMutation } from '@/modules/tasks/api/useAssignTaskMutation'
import { getAssignableUserItems } from '@/modules/tasks/utils/assignableUsers'
import type { TaskDto } from '@/modules/tasks/utils/types'
import { useUsersQuery } from '@/modules/users/api/useUsersQuery'

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
  const { data: projects } = useProjectsQuery()
  const { data: departments } = useDepartmentsQuery()
  const { data: users } = useUsersQuery()
  const { mutateAsync, isPending } = useAssignTaskMutation()
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(
    task.assignedUsers?.map((user) => String(user.id)) ?? []
  )
  const [error, setError] = useState<string | null>(null)

  const projectId = task.projectId != null && task.projectId !== '' ? String(task.projectId) : null
  const departmentId =
    task.departmentId != null && task.departmentId !== '' ? String(task.departmentId) : null
  const project = projects?.find((p) => String(p.id) === projectId)
  const department = departments?.find((d) => String(d.id) === departmentId)

  const assignItems = getAssignableUserItems({
    workspaceUsers: users,
    projectMembers: project?.members,
    departmentUsers: department?.users,
    projectId,
    departmentId,
  })

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      await mutateAsync({ taskId: task.id, assignedUserIds })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Atama yapılamadı')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-2">
        <Label>Kullanıcılar</Label>
        <MultiSelectCheckList
          items={assignItems}
          selectedIds={assignedUserIds}
          onChange={setAssignedUserIds}
          disabled={isPending}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          Kaydet
        </Button>
      </DialogFooter>
    </form>
  )
}
