import { useRef, useState, type ChangeEvent } from 'react'
import { Paperclip, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/modules/attachments/utils/formatFileSize'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

interface PendingFilesPickerProps {
  files: File[]
  onChange: (files: File[]) => void
}

export function PendingFilesPicker({ files, onChange }: PendingFilesPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Dosya boyutu 10MB'ı geçemez")
      return
    }

    setError(null)
    onChange([...files, file])
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        <Paperclip />
        Dosya Ekle
      </Button>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {files.map((file, index) => (
            <Badge key={`${file.name}-${index}`} variant="secondary" className="gap-1 pr-1">
              <span className="max-w-48 truncate">
                {file.name} ({formatFileSize(file.size)})
              </span>
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-black/10"
                onClick={() => removeFile(index)}
                aria-label={`${file.name} dosyasını kaldır`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
