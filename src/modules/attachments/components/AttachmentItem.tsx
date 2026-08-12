import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'
import { getCurrentUserId } from '@/lib/currentUser'
import { useDeleteAttachmentMutation } from '@/modules/attachments/api/useDeleteAttachmentMutation'
import { formatFileSize } from '@/modules/attachments/utils/formatFileSize'
import { getAttachmentIcon } from '@/modules/attachments/utils/fileIcon'
import type { AttachmentDto } from '@/modules/attachments/utils/types'

interface AttachmentItemProps {
  attachment: AttachmentDto
  taskId: string
}

export function AttachmentItem({ attachment, taskId }: AttachmentItemProps) {
  const { hasPermission } = useAuth()
  const deleteMutation = useDeleteAttachmentMutation()
  const currentUserId = getCurrentUserId()
  const Icon = getAttachmentIcon(attachment.contentType)
  const canDelete =
    (currentUserId !== null && String(attachment.uploadedByUserId) === currentUserId) ||
    hasPermission('tasks.delete.all')

  function openDownload() {
    window.open(attachment.downloadUrl, '_blank')
  }

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <button
        type="button"
        className="min-w-0 truncate text-left font-medium hover:underline"
        onClick={openDownload}
      >
        {attachment.fileName}
      </button>
      <span className="shrink-0 text-xs text-muted-foreground">
        {formatFileSize(attachment.fileSize)}
      </span>
      <span className="min-w-0 truncate text-xs text-muted-foreground">
        {attachment.uploadedByUserName}
      </span>
      {canDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="ml-auto shrink-0"
          disabled={deleteMutation.isPending}
          onClick={() =>
            deleteMutation.mutate({ id: String(attachment.id), taskId: String(taskId) })
          }
        >
          <Trash2 />
          <span className="sr-only">Dosyayı sil</span>
        </Button>
      )}
    </div>
  )
}
