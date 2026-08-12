import { AttachmentItem } from '@/modules/attachments/components/AttachmentItem'
import { FileUploadButton } from '@/modules/attachments/components/FileUploadButton'
import { useTaskAttachmentsQuery } from '@/modules/attachments/api/useTaskAttachmentsQuery'

interface AttachmentListProps {
  taskId: string
}

export function AttachmentList({ taskId }: AttachmentListProps) {
  const { data: attachments, isLoading, error } = useTaskAttachmentsQuery(taskId)
  const items = attachments ?? []

  return (
    <div className="space-y-2">
      <FileUploadButton taskId={taskId} />

      {isLoading && <p className="text-sm text-muted-foreground">Dosyalar yükleniyor...</p>}

      {error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Dosyalar yüklenemedi'}
        </p>
      )}

      {!isLoading && !error && items.length === 0 && (
        <p className="text-sm text-muted-foreground">Henüz dosya eklenmedi</p>
      )}

      {!isLoading && !error && items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((attachment) => (
            <li key={String(attachment.id)}>
              <AttachmentItem attachment={attachment} taskId={taskId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
