import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getStatusColor, STATUS_COLOR_KEYS, type StatusColorKey } from '@/lib/statusColors'
import { useCreateStatusMutation } from '@/modules/statuses/api/useCreateStatusMutation'
import { useUpdateStatusMutation } from '@/modules/statuses/api/useUpdateStatusMutation'
import { statusSchema, type StatusFormValues } from '@/modules/statuses/utils/schemas'
import type { TaskStatusDto } from '@/modules/statuses/utils/types'

const COLOR_OPTIONS = STATUS_COLOR_KEYS.map((key) => ({
  value: key,
  label: key,
}))

function toId(value: string | number): string {
  return String(value)
}

interface StatusFormDialogProps {
  mode: 'create' | 'edit'
  status?: TaskStatusDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StatusFormDialog({
  mode,
  status,
  open,
  onOpenChange,
}: StatusFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {open && (
          <StatusFormFields mode={mode} status={status} onOpenChange={onOpenChange} />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface StatusFormFieldsProps {
  mode: 'create' | 'edit'
  status?: TaskStatusDto
  onOpenChange: (open: boolean) => void
}

function StatusFormFields({ mode, status, onOpenChange }: StatusFormFieldsProps) {
  const createMutation = useCreateStatusMutation()
  const updateMutation = useUpdateStatusMutation()
  const isPending = mode === 'create' ? createMutation.isPending : updateMutation.isPending
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues:
      mode === 'edit' && status
        ? {
            name: status.name,
            colorKey: (STATUS_COLOR_KEYS.includes(status.colorKey as StatusColorKey)
              ? status.colorKey
              : 'gray') as StatusFormValues['colorKey'],
            isDefault: status.isDefault,
          }
        : { name: '', colorKey: 'gray', isDefault: false },
  })

  async function onSubmit(values: StatusFormValues) {
    setError(null)
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          name: values.name,
          colorKey: values.colorKey,
          isDefault: values.isDefault,
        })
      } else if (status) {
        await updateMutation.mutateAsync({
          id: toId(status.id),
          dto: {
            name: values.name,
            colorKey: values.colorKey,
            isDefault: values.isDefault,
            displayOrder: status.displayOrder,
          },
        })
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Durum kaydedilemedi')
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Durum' : 'Durumu Düzenle'}</DialogTitle>
      </DialogHeader>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="status-name">Ad</Label>
          <Input id="status-name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Renk</Label>
          <Controller
            control={control}
            name="colorKey"
            render={({ field }) => (
              <Select
                items={COLOR_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Renk seçin" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((option) => {
                    const color = getStatusColor(option.value)
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: color.dot }}
                          />
                          {option.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            )}
          />
          {errors.colorKey && (
            <p className="text-xs text-destructive">{errors.colorKey.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <Controller
            control={control}
            name="isDefault"
            render={({ field }) => (
              <>
                <Checkbox
                  id="status-isDefault"
                  checked={field.value}
                  disabled={isPending}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <Label htmlFor="status-isDefault" className="font-normal">
                  Varsayılan durum (yeni görevler bu durumda başlasın)
                </Label>
              </>
            )}
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
