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
import { useDeleteStatusMutation } from '@/modules/statuses/api/useDeleteStatusMutation'

interface DeleteStatusDialogProps {
  statusId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteStatusDialog({
  statusId,
  open,
  onOpenChange,
}: DeleteStatusDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {open && (
          <DeleteStatusDialogBody statusId={statusId} onOpenChange={onOpenChange} />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface DeleteStatusDialogBodyProps {
  statusId: string
  onOpenChange: (open: boolean) => void
}

function DeleteStatusDialogBody({
  statusId,
  onOpenChange,
}: DeleteStatusDialogBodyProps) {
  const { mutateAsync, isPending } = useDeleteStatusMutation()
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setError(null)
    try {
      await mutateAsync(statusId)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Durum silinemedi')
    }
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Bu durumu silmek istediğine emin misin?</AlertDialogTitle>
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
