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
import { useDeleteProjectMutation } from '@/modules/projects/api/useDeleteProjectMutation'

interface DeleteProjectDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteProjectDialog({
  projectId,
  open,
  onOpenChange,
}: DeleteProjectDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {open && (
          <DeleteProjectDialogBody projectId={projectId} onOpenChange={onOpenChange} />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface DeleteProjectDialogBodyProps {
  projectId: string
  onOpenChange: (open: boolean) => void
}

function DeleteProjectDialogBody({
  projectId,
  onOpenChange,
}: DeleteProjectDialogBodyProps) {
  const { mutateAsync, isPending } = useDeleteProjectMutation()
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setError(null)
    try {
      await mutateAsync(projectId)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Proje silinemedi')
    }
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Bu projeyi silmek istediğine emin misin?</AlertDialogTitle>
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
