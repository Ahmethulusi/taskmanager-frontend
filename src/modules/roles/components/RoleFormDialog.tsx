import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { MultiSelectCheckList } from '@/components/shared/MultiSelectCheckList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePermissionsQuery } from '@/modules/roles/api/usePermissionsQuery'
import { useCreateRoleMutation } from '@/modules/roles/api/useCreateRoleMutation'
import { useUpdateRoleMutation } from '@/modules/roles/api/useUpdateRoleMutation'
import { roleSchema, type RoleFormValues } from '@/modules/roles/utils/schemas'
import type { RoleDto } from '@/modules/roles/utils/types'

function toId(value: string | number): string {
  return String(value)
}

interface RoleFormDialogProps {
  mode: 'create' | 'edit'
  role?: RoleDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoleFormDialog({ mode, role, open, onOpenChange }: RoleFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {open && <RoleFormFields mode={mode} role={role} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  )
}

interface RoleFormFieldsProps {
  mode: 'create' | 'edit'
  role?: RoleDto
  onOpenChange: (open: boolean) => void
}

function RoleFormFields({ mode, role, onOpenChange }: RoleFormFieldsProps) {
  const { data: permissions } = usePermissionsQuery()
  const createMutation = useCreateRoleMutation()
  const updateMutation = useUpdateRoleMutation()
  const isPending = mode === 'create' ? createMutation.isPending : updateMutation.isPending

  const [permissionIds, setPermissionIds] = useState<string[]>(
    mode === 'edit' && role ? role.permissions?.map((permission) => toId(permission.id)) ?? [] : []
  )
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues:
      mode === 'edit' && role
        ? {
            name: role.name,
            permissionIds: role.permissions?.map((permission) => toId(permission.id)) ?? [],
          }
        : { name: '', permissionIds: [] },
  })

  async function onSubmit(values: RoleFormValues) {
    setError(null)
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({ name: values.name, permissionIds })
      } else if (role) {
        await updateMutation.mutateAsync({
          id: toId(role.id),
          dto: { name: values.name, permissionIds },
        })
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rol kaydedilemedi')
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Rol' : 'Rolü Düzenle'}</DialogTitle>
      </DialogHeader>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="role-name">Ad</Label>
          <Input id="role-name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label>İzinler</Label>
          <MultiSelectCheckList
            items={
              permissions?.map((permission) => ({
                id: toId(permission.id),
                label: `${permission.key} — ${permission.description}`,
              })) ?? []
            }
            selectedIds={permissionIds}
            onChange={setPermissionIds}
            disabled={isPending}
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {mode === 'create' ? 'Oluştur' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
