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
import { useDeleteTaskMutation } from '@/modules/tasks/api/useDeleteTaskMutation'

interface DeleteTaskDialogProps {
  taskId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteTaskDialog({ taskId, open, onOpenChange }: DeleteTaskDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {open && <DeleteTaskDialogBody taskId={taskId} onOpenChange={onOpenChange} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface DeleteTaskDialogBodyProps {
  taskId: string
  onOpenChange: (open: boolean) => void
}

function DeleteTaskDialogBody({ taskId, onOpenChange }: DeleteTaskDialogBodyProps) {
  const { mutateAsync, isPending } = useDeleteTaskMutation()
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setError(null)
    try {
      await mutateAsync(taskId)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görev silinemedi')
    }
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Bu görevi silmek istediğine emin misin?</AlertDialogTitle>
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
