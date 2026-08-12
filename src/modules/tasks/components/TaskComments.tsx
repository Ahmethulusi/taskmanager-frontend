import { useRef, useState, type ChangeEvent } from 'react'
import { Loader2, Paperclip, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useUploadAttachmentMutation } from '@/modules/attachments/api/useUploadAttachmentMutation'
import { getAttachmentIcon } from '@/modules/attachments/utils/fileIcon'
import type { AttachmentDto } from '@/modules/attachments/utils/types'
import { useCreateCommentMutation } from '@/modules/comments/api/useCreateCommentMutation'

interface TaskCommentsProps {
  taskId: string
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const createMutation = useCreateCommentMutation()
  const uploadMutation = useUploadAttachmentMutation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newContent, setNewContent] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<AttachmentDto[]>([])
  const [actionError, setActionError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const isBusy = createMutation.isPending || uploadMutation.isPending

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    setUploadError(null)
    try {
      const attachment = await uploadMutation.mutateAsync({ taskId, file })
      setPendingAttachments((current) => [...current, attachment])
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Dosya yüklenemedi')
    }
  }

  async function handleCreate() {
    const content = newContent.trim()
    if (!content) {
      return
    }
    setActionError(null)
    try {
      await createMutation.mutateAsync({
        taskId,
        content,
        attachmentIds: pendingAttachments.map((attachment) => String(attachment.id)),
      })
      setNewContent('')
      setPendingAttachments([])
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Yorum eklenemedi')
    }
  }

  return (
    <div className="shrink-0 space-y-2 border-t bg-background pt-3">
      {pendingAttachments.length > 0 && (
        <div className="flex flex-col items-end gap-1.5">
          {pendingAttachments.map((attachment) => (
            <PendingAttachmentChip
              key={String(attachment.id)}
              attachment={attachment}
              onRemove={() =>
                setPendingAttachments((current) =>
                  current.filter((item) => String(item.id) !== String(attachment.id))
                )
              }
            />
          ))}
        </div>
      )}

      <div className="relative">
        <Textarea
          value={newContent}
          onChange={(event) => setNewContent(event.target.value)}
          placeholder="Yorumunuzu yazın"
          disabled={isBusy}
          className="min-h-20 resize-none pr-10"
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="absolute right-2 bottom-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          disabled={isBusy}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Dosya ekle"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Paperclip className="size-4" />
          )}
        </button>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={isBusy || !newContent.trim()}
          onClick={handleCreate}
        >
          Yorum Ekle
        </Button>
      </div>

      {(uploadError || actionError) && (
        <p className="text-sm text-destructive">{uploadError ?? actionError}</p>
      )}
    </div>
  )
}

function PendingAttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: AttachmentDto
  onRemove: () => void
}) {
  const Icon = getAttachmentIcon(attachment.contentType)

  return (
    <div className="flex max-w-[85%] items-center gap-2 rounded-2xl rounded-br-sm bg-primary/10 px-3 py-1.5 text-sm">
      <Icon className="size-3.5 shrink-0 text-primary/80" />
      <span className="min-w-0 truncate">{attachment.fileName}</span>
      <button
        type="button"
        className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-black/10 hover:text-foreground"
        onClick={onRemove}
        aria-label={`${attachment.fileName} ekini kaldır`}
      >
        <X className="size-3" />
      </button>
    </div>
  )
}
