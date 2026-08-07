import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/AuthContext'
import { useDepartmentsQuery } from '@/modules/departments/api/useDepartmentsQuery'
import { useCreateTaskMutation } from '@/modules/tasks/api/useCreateTaskMutation'
import { useUpdateTaskMutation } from '@/modules/tasks/api/useUpdateTaskMutation'
import { createTaskSchema, updateTaskSchema, type CreateTaskFormValues } from '@/modules/tasks/utils/schemas'
import type { TaskDto } from '@/modules/tasks/utils/types'
import { useUsersQuery } from '@/modules/users/api/useUsersQuery'

const NO_DEPARTMENT = 'none'
const UNASSIGNED = 'none'

const PRIORITY_OPTIONS: { value: CreateTaskFormValues['priority']; label: string }[] = [
  { value: 'Dusuk', label: 'Düşük' },
  { value: 'Orta', label: 'Orta' },
  { value: 'Yuksek', label: 'Yüksek' },
]

interface TaskFormDialogProps {
  mode: 'create' | 'edit'
  task?: TaskDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskFormDialog({ mode, task, open, onOpenChange }: TaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Mounted fresh each time the dialog opens, so form state naturally starts clean
            from current props instead of needing a reset-on-open effect. */}
        {open && <TaskFormFields mode={mode} task={task} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  )
}

interface TaskFormFieldsProps {
  mode: 'create' | 'edit'
  task?: TaskDto
  onOpenChange: (open: boolean) => void
}

function TaskFormFields({ mode, task, onOpenChange }: TaskFormFieldsProps) {
  const { user } = useAuth()
  const { data: departments } = useDepartmentsQuery()
  const showAssignField = mode === 'create' && user?.role === 'Admin'
  const { data: users } = useUsersQuery()

  const [assignedToUserId, setAssignedToUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateTaskMutation()
  const updateMutation = useUpdateTaskMutation()
  const isPending = mode === 'create' ? createMutation.isPending : updateMutation.isPending

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(mode === 'create' ? createTaskSchema : updateTaskSchema),
    defaultValues:
      mode === 'edit' && task
        ? {
            title: task.title,
            description: task.description ?? '',
            priority: task.priority as CreateTaskFormValues['priority'],
            departmentId: task.departmentId ?? undefined,
          }
        : { title: '', description: '', priority: undefined, departmentId: undefined },
  })

  async function onSubmit(values: CreateTaskFormValues) {
    setError(null)
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          title: values.title,
          description: values.description || null,
          priority: values.priority,
          departmentId: values.departmentId || undefined,
          assignedToUserId: showAssignField ? assignedToUserId : undefined,
        })
      } else if (task) {
        await updateMutation.mutateAsync({
          taskId: task.id,
          dto: {
            title: values.title,
            description: values.description || null,
            priority: values.priority,
            departmentId: values.departmentId || undefined,
          },
        })
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görev kaydedilemedi')
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Görev' : 'Görevi Düzenle'}</DialogTitle>
      </DialogHeader>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        <div>
          <Label htmlFor="title">Başlık</Label>
          <Input id="title" {...register('title')} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Açıklama</Label>
          <Textarea id="description" {...register('description')} />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label>Öncelik</Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select
                items={PRIORITY_OPTIONS}
                value={field.value ?? null}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Öncelik seçin" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.priority && <p className="text-xs text-destructive">{errors.priority.message}</p>}
        </div>

        <div>
          <Label>Departman</Label>
          <Controller
            control={control}
            name="departmentId"
            render={({ field }) => (
              <Select
                items={[
                  { value: NO_DEPARTMENT, label: 'Departman Yok' },
                  ...(departments?.map((department) => ({ value: department.id, label: department.name })) ?? []),
                ]}
                value={field.value ?? NO_DEPARTMENT}
                onValueChange={(value) => field.onChange(value === NO_DEPARTMENT ? undefined : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Departman seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_DEPARTMENT}>Departman Yok</SelectItem>
                  {departments?.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {showAssignField && (
          <div>
            <Label>Ata</Label>
            <Select
              items={[
                { value: UNASSIGNED, label: 'Atanmadı' },
                ...(users?.map((u) => ({ value: u.id, label: u.fullName })) ?? []),
              ]}
              value={assignedToUserId ?? UNASSIGNED}
              onValueChange={(value) => setAssignedToUserId(value === UNASSIGNED ? null : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kullanıcı seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Atanmadı</SelectItem>
                {users?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {mode === 'create' ? 'Oluştur' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
