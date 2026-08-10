import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { MultiSelectCheckList } from '@/components/shared/MultiSelectCheckList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateDepartmentMutation } from '@/modules/departments/api/useCreateDepartmentMutation'
import { useUpdateDepartmentMutation } from '@/modules/departments/api/useUpdateDepartmentMutation'
import {
  departmentSchema,
  type DepartmentFormValues,
} from '@/modules/departments/utils/schemas'
import type { DepartmentDto } from '@/modules/departments/utils/types'
import { useUsersQuery } from '@/modules/users/api/useUsersQuery'

const NO_MANAGER = 'none'

function toId(value: string | number): string {
  return String(value)
}

interface DepartmentFormDialogProps {
  mode: 'create' | 'edit'
  department?: DepartmentDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepartmentFormDialog({
  mode,
  department,
  open,
  onOpenChange,
}: DepartmentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {open && (
          <DepartmentFormFields
            mode={mode}
            department={department}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface DepartmentFormFieldsProps {
  mode: 'create' | 'edit'
  department?: DepartmentDto
  onOpenChange: (open: boolean) => void
}

function DepartmentFormFields({ mode, department, onOpenChange }: DepartmentFormFieldsProps) {
  const { data: users } = useUsersQuery()
  const createMutation = useCreateDepartmentMutation()
  const updateMutation = useUpdateDepartmentMutation()
  const isPending = mode === 'create' ? createMutation.isPending : updateMutation.isPending

  const [userIds, setUserIds] = useState<string[]>(
    mode === 'edit' && department
      ? department.users?.map((user) => toId(user.id)) ?? []
      : []
  )
  const [managerId, setManagerId] = useState<string | null>(
    mode === 'edit' && department && department.managerId != null
      ? toId(department.managerId)
      : null
  )
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues:
      mode === 'edit' && department
        ? {
            name: department.name,
            userIds: department.users?.map((user) => toId(user.id)) ?? [],
          }
        : { name: '', userIds: [] },
  })

  const managerItems = [
    { value: NO_MANAGER, label: 'Yok' },
    ...(users?.map((user) => ({ value: toId(user.id), label: user.fullName })) ?? []),
  ]

  if (
    mode === 'edit' &&
    department?.managerId != null &&
    !managerItems.some((item) => item.value === toId(department.managerId!))
  ) {
    managerItems.push({
      value: toId(department.managerId),
      label: department.managerName ?? 'Yönetici',
    })
  }

  async function onSubmit(values: DepartmentFormValues) {
    setError(null)
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({ name: values.name, userIds, managerId })
      } else if (department) {
        await updateMutation.mutateAsync({
          id: toId(department.id),
          name: values.name,
          userIds,
          managerId,
        })
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Departman kaydedilemedi')
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Departman' : 'Departmanı Düzenle'}</DialogTitle>
      </DialogHeader>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="department-name">Ad</Label>
          <Input id="department-name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Departman Yöneticisi</Label>
          <Select
            items={managerItems}
            value={managerId ?? NO_MANAGER}
            onValueChange={(value) =>
              setManagerId(value === NO_MANAGER || value === null ? null : toId(value))
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Yönetici seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_MANAGER}>Yok</SelectItem>
              {users?.map((user) => (
                <SelectItem key={toId(user.id)} value={toId(user.id)}>
                  {user.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Kullanıcılar</Label>
          <MultiSelectCheckList
            items={users?.map((user) => ({ id: toId(user.id), label: user.fullName })) ?? []}
            selectedIds={userIds}
            onChange={setUserIds}
            disabled={isPending}
          />
        </div>

        <DialogFooter className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            {mode === 'create' ? 'Oluştur' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
