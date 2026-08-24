import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { DatePicker } from '@/components/shared/DatePicker'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toApiDueDate, toDateInputValue } from '@/modules/tasks/utils/dueDate'
import { useCreateSprintMutation } from '@/modules/sprints/api/useCreateSprintMutation'
import { useUpdateSprintMutation } from '@/modules/sprints/api/useUpdateSprintMutation'
import { sprintSchema, type SprintFormValues } from '@/modules/sprints/utils/schemas'
import type { SprintDto } from '@/modules/sprints/utils/types'

interface SprintFormDialogProps {
  mode: 'create' | 'edit'
  projectId: string
  sprint?: SprintDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SprintFormDialog({
  mode,
  projectId,
  sprint,
  open,
  onOpenChange,
}: SprintFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <SprintFormFields
            mode={mode}
            projectId={projectId}
            sprint={sprint}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface SprintFormFieldsProps {
  mode: 'create' | 'edit'
  projectId: string
  sprint?: SprintDto
  onOpenChange: (open: boolean) => void
}

function SprintFormFields({ mode, projectId, sprint, onOpenChange }: SprintFormFieldsProps) {
  const createMutation = useCreateSprintMutation()
  const updateMutation = useUpdateSprintMutation()
  const isPending = mode === 'create' ? createMutation.isPending : updateMutation.isPending
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SprintFormValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues:
      mode === 'edit' && sprint
        ? {
            name: sprint.name,
            startDate: toDateInputValue(sprint.startDate),
            endDate: toDateInputValue(sprint.endDate),
          }
        : { name: '', startDate: '', endDate: '' },
  })

  async function onSubmit(values: SprintFormValues) {
    setError(null)
    const dto = {
      name: values.name,
      startDate: toApiDueDate(values.startDate) ?? values.startDate,
      endDate: toApiDueDate(values.endDate) ?? values.endDate,
    }

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({ projectId, dto })
      } else if (sprint) {
        await updateMutation.mutateAsync({ id: String(sprint.id), projectId, dto })
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sprint kaydedilemedi')
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Sprint' : "Sprint'i Düzenle"}</DialogTitle>
      </DialogHeader>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sprint-name">Ad</Label>
          <Input id="sprint-name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sprint-startDate">Başlangıç Tarihi</Label>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <DatePicker
                  id="sprint-startDate"
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? '')}
                  disabled={isPending}
                />
              )}
            />
            {errors.startDate && (
              <p className="text-xs text-destructive">{errors.startDate.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sprint-endDate">Bitiş Tarihi</Label>
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <DatePicker
                  id="sprint-endDate"
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? '')}
                  disabled={isPending}
                />
              )}
            />
            {errors.endDate && (
              <p className="text-xs text-destructive">{errors.endDate.message}</p>
            )}
          </div>
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
