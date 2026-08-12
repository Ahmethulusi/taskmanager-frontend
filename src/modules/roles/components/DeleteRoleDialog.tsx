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
import { useDeleteRoleMutation } from '@/modules/roles/api/useDeleteRoleMutation'

interface DeleteRoleDialogProps {
  roleId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteRoleDialog({ roleId, open, onOpenChange }: DeleteRoleDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {open && <DeleteRoleDialogBody roleId={roleId} onOpenChange={onOpenChange} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface DeleteRoleDialogBodyProps {
  roleId: string
  onOpenChange: (open: boolean) => void
}

function DeleteRoleDialogBody({ roleId, onOpenChange }: DeleteRoleDialogBodyProps) {
  const { mutateAsync, isPending } = useDeleteRoleMutation()
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setError(null)
    try {
      await mutateAsync(roleId)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rol silinemedi')
    }
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Bu rolü silmek istediğine emin misin?</AlertDialogTitle>
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
