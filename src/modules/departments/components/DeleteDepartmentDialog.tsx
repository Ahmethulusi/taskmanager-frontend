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
import { useDeleteDepartmentMutation } from '@/modules/departments/api/useDeleteDepartmentMutation'

interface DeleteDepartmentDialogProps {
  departmentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteDepartmentDialog({
  departmentId,
  open,
  onOpenChange,
}: DeleteDepartmentDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {open && (
          <DeleteDepartmentDialogBody departmentId={departmentId} onOpenChange={onOpenChange} />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface DeleteDepartmentDialogBodyProps {
  departmentId: string
  onOpenChange: (open: boolean) => void
}

function DeleteDepartmentDialogBody({
  departmentId,
  onOpenChange,
}: DeleteDepartmentDialogBodyProps) {
  const { mutateAsync, isPending } = useDeleteDepartmentMutation()
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setError(null)
    try {
      await mutateAsync(departmentId)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Departman silinemedi')
    }
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Bu departmanı silmek istediğine emin misin?</AlertDialogTitle>
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
