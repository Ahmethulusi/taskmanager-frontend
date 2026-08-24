import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteSprintMutation } from '@/modules/sprints/api/useDeleteSprintMutation'

interface DeleteSprintDialogProps {
  sprintId: string
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteSprintDialog({
  sprintId,
  projectId,
  open,
  onOpenChange,
}: DeleteSprintDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {open && (
          <DeleteSprintDialogBody
            sprintId={sprintId}
            projectId={projectId}
            onOpenChange={onOpenChange}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface DeleteSprintDialogBodyProps {
  sprintId: string
  projectId: string
  onOpenChange: (open: boolean) => void
}

function DeleteSprintDialogBody({
  sprintId,
  projectId,
  onOpenChange,
}: DeleteSprintDialogBodyProps) {
  const { mutateAsync, isPending } = useDeleteSprintMutation()
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setError(null)
    try {
      await mutateAsync({ id: sprintId, projectId })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sprint silinemedi')
    }
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Bu sprint'i silmek istediğine emin misin?</AlertDialogTitle>
        <AlertDialogDescription>Bu işlem geri alınamaz.</AlertDialogDescription>
      </AlertDialogHeader>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>Vazgeç</AlertDialogCancel>
        <AlertDialogAction
          className="bg-destructive text-white hover:bg-destructive/90"
          disabled={isPending}
          onClick={handleConfirm}
        >
          Sil
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}
