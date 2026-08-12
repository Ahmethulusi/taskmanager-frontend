import { useRef, useState, type ChangeEvent } from 'react'
import { Loader2, Paperclip } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useUploadAttachmentMutation } from '@/modules/attachments/api/useUploadAttachmentMutation'
import type { AttachmentDto } from '@/modules/attachments/utils/types'

interface FileUploadButtonProps {
  taskId: string
  onUploaded?: (attachment: AttachmentDto) => void
}

export function FileUploadButton({ taskId, onUploaded }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const uploadMutation = useUploadAttachmentMutation()

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    setError(null)
    try {
      const attachment = await uploadMutation.mutateAsync({ taskId, file })
      onUploaded?.(attachment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dosya yüklenemedi')
    }
  }

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploadMutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {uploadMutation.isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Paperclip />
        )}
        {uploadMutation.isPending ? 'Yükleniyor...' : 'Dosya Ekle'}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
