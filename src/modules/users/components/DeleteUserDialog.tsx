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
import { useDeleteUserMutation } from '@/modules/users/api/useDeleteUserMutation'

interface DeleteUserDialogProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({ userId, open, onOpenChange }: DeleteUserDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {open && <DeleteUserDialogBody userId={userId} onOpenChange={onOpenChange} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface DeleteUserDialogBodyProps {
  userId: string
  onOpenChange: (open: boolean) => void
}

function DeleteUserDialogBody({ userId, onOpenChange }: DeleteUserDialogBodyProps) {
  const { mutateAsync, isPending } = useDeleteUserMutation()
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setError(null)
    try {
      await mutateAsync(userId)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcı silinemedi')
    }
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Bu kullanıcıyı silmek istediğine emin misin?</AlertDialogTitle>
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
