import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { MultiSelectCheckList } from '@/components/shared/MultiSelectCheckList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDepartmentsQuery } from '@/modules/departments/api/useDepartmentsQuery'
import { useCreateUserMutation } from '@/modules/users/api/useCreateUserMutation'
import { useUpdateUserMutation } from '@/modules/users/api/useUpdateUserMutation'
import {
  userCreateSchema,
  userEditSchema,
  type UserCreateFormValues,
  type UserEditFormValues,
} from '@/modules/users/utils/schemas'
import type { UserDto } from '@/modules/users/utils/types'

const ROLE_OPTIONS: { value: UserEditFormValues['role']; label: string }[] = [
  { value: 'Admin', label: 'Admin' },
  { value: 'User', label: 'User' },
]

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
  const { data: departments } = useDepartmentsQuery()
  const { mutateAsync, isPending } = useCreateUserMutation()
  const [departmentIds, setDepartmentIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: { fullName: '', email: '', password: '', role: 'User', departmentIds: [] },
  })

  async function onSubmit(values: UserCreateFormValues) {
    setError(null)
    try {
      await mutateAsync({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
        departmentIds,
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

        <div className="flex flex-col gap-2">
          <Label>Rol</Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select
                items={ROLE_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
        </div>

        <UserDepartmentsField
          departments={departments}
          departmentIds={departmentIds}
          onChange={setDepartmentIds}
          disabled={isPending}
        />

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
  const { data: departments } = useDepartmentsQuery()
  const { mutateAsync, isPending } = useUpdateUserMutation()
  const [departmentIds, setDepartmentIds] = useState<string[]>(
    user.departments?.map((department) => toId(department.id)) ?? []
  )
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      role: user.role === 'Admin' || user.role === 'User' ? user.role : 'User',
      departmentIds: user.departments?.map((department) => toId(department.id)) ?? [],
    },
  })

  async function onSubmit(values: UserEditFormValues) {
    setError(null)
    try {
      await mutateAsync({
        id: toId(user.id),
        dto: {
          fullName: values.fullName,
          email: values.email,
          role: values.role,
          departmentIds,
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

        <div className="flex flex-col gap-2">
          <Label>Rol</Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select
                items={ROLE_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
        </div>

        <UserDepartmentsField
          departments={departments}
          departmentIds={departmentIds}
          onChange={setDepartmentIds}
          disabled={isPending}
        />

        <DialogFooter className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            Kaydet
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

interface UserDepartmentsFieldProps {
  departments: { id: string | number; name: string }[] | undefined
  departmentIds: string[]
  onChange: (ids: string[]) => void
  disabled: boolean
}

function UserDepartmentsField({
  departments,
  departmentIds,
  onChange,
  disabled,
}: UserDepartmentsFieldProps) {
  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <Label>Departmanlar</Label>
      <MultiSelectCheckList
        items={
          departments?.map((department) => ({
            id: toId(department.id),
            label: department.name,
          })) ?? []
        }
        selectedIds={departmentIds}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}
