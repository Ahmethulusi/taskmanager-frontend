import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { MultiSelectCheckList } from '@/components/shared/MultiSelectCheckList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRolesQuery } from '@/modules/roles/api/useRolesQuery'
import { useCreateUserMutation } from '@/modules/users/api/useCreateUserMutation'
import { useUpdateUserMutation } from '@/modules/users/api/useUpdateUserMutation'
import {
  userCreateSchema,
  userEditSchema,
  type UserCreateFormValues,
  type UserEditFormValues,
} from '@/modules/users/utils/schemas'
import type { UserDto } from '@/modules/users/utils/types'

function toId(value: string | number): string {
  return String(value)
}

interface UserEditDialogProps {
  mode: 'create' | 'edit'
  user?: UserDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserEditDialog({ mode, user, open, onOpenChange }: UserEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {open && mode === 'create' && (
          <UserCreateDialogFields onOpenChange={onOpenChange} />
        )}
        {open && mode === 'edit' && user && (
          <UserEditDialogFields user={user} onOpenChange={onOpenChange} />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface UserCreateDialogFieldsProps {
  onOpenChange: (open: boolean) => void
}

function UserCreateDialogFields({ onOpenChange }: UserCreateDialogFieldsProps) {
  const { data: roles } = useRolesQuery()
  const { mutateAsync, isPending } = useCreateUserMutation()
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: { fullName: '', email: '', password: '', roleIds: [] },
  })

  async function onSubmit(values: UserCreateFormValues) {
    setError(null)
    try {
      await mutateAsync({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        roleIds: values.roleIds,
        // Departman ataması bu formdan kaldırıldı; yeni kullanıcılar
        // departmansız oluşturulur.
        departmentIds: [],
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcı oluşturulamadı')
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Yeni Kullanıcı</DialogTitle>
      </DialogHeader>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="user-fullName">Ad Soyad</Label>
          <Input id="user-fullName" {...register('fullName')} />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="user-email">E-posta</Label>
          <Input id="user-email" type="email" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="user-password">Şifre</Label>
          <Input id="user-password" type="password" {...register('password')} />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Roller</Label>
          <Controller
            control={control}
            name="roleIds"
            render={({ field }) => (
              <MultiSelectCheckList
                items={roles?.map((role) => ({ id: toId(role.id), label: role.name })) ?? []}
                selectedIds={field.value ?? []}
                onChange={field.onChange}
                disabled={isPending}
              />
            )}
          />
          {errors.roleIds && <p className="text-xs text-destructive">{errors.roleIds.message}</p>}
        </div>

        <DialogFooter className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            Oluştur
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

interface UserEditDialogFieldsProps {
  user: UserDto
  onOpenChange: (open: boolean) => void
}

function UserEditDialogFields({ user, onOpenChange }: UserEditDialogFieldsProps) {
  const { data: roles } = useRolesQuery()
  const { mutateAsync, isPending } = useUpdateUserMutation()
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      roleIds: [],
    },
  })

  // UserDto.roles yalnızca rol isimlerini döndürüyor, Id değil — form için
  // gereken roleIds'i, roller yüklendiğinde isimleri eşleştirerek bir kez hesaplıyoruz.
  const didInitRoleIds = useRef(false)
  useEffect(() => {
    if (!didInitRoleIds.current && roles) {
      const matchedIds = roles
        .filter((role) => user.roles?.includes(role.name))
        .map((role) => toId(role.id))
      setValue('roleIds', matchedIds)
      didInitRoleIds.current = true
    }
  }, [roles, user.roles, setValue])

  async function onSubmit(values: UserEditFormValues) {
    setError(null)
    try {
      await mutateAsync({
        id: toId(user.id),
        dto: {
          fullName: values.fullName,
          email: values.email,
          roleIds: values.roleIds,
          // Departman ataması bu formdan kaldırıldı; endpoint tam-değiştirme
          // semantiğiyle çalıştığı için mevcut atamaları korumak amacıyla
          // kullanıcının GÜNCEL departman id'lerini olduğu gibi geri gönderiyoruz.
          departmentIds: user.departments?.map((department) => toId(department.id)) ?? [],
        },
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcı güncellenemedi')
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
      </DialogHeader>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="user-fullName">Ad Soyad</Label>
          <Input id="user-fullName" {...register('fullName')} />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="user-email">E-posta</Label>
          <Input id="user-email" type="email" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Roller</Label>
          <Controller
            control={control}
            name="roleIds"
            render={({ field }) => (
              <MultiSelectCheckList
                items={roles?.map((role) => ({ id: toId(role.id), label: role.name })) ?? []}
                selectedIds={field.value ?? []}
                onChange={field.onChange}
                disabled={isPending}
              />
            )}
          />
          {errors.roleIds && <p className="text-xs text-destructive">{errors.roleIds.message}</p>}
        </div>

        <DialogFooter className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            Kaydet
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
