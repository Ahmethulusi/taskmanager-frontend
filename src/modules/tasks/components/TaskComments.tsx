import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCreateCommentMutation } from '@/modules/comments/api/useCreateCommentMutation'

interface TaskCommentsProps {
  taskId: string
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const createMutation = useCreateCommentMutation()
  const [newContent, setNewContent] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleCreate() {
    const content = newContent.trim()
    if (!content) {
      return
    }
    setActionError(null)
    try {
      await createMutation.mutateAsync({ taskId, content })
      setNewContent('')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Yorum eklenemedi')
    }
  }

  return (
    <div className="shrink-0 space-y-2 border-t bg-background pt-3">
      <Textarea
        value={newContent}
        onChange={(event) => setNewContent(event.target.value)}
        placeholder="Yorumunuzu yazın"
        disabled={createMutation.isPending}
      />
      <Button
        type="button"
        size="sm"
        disabled={createMutation.isPending || !newContent.trim()}
        onClick={handleCreate}
      >
        Yorum Ekle
      </Button>
      {actionError && <p className="text-sm text-destructive">{actionError}</p>}
    </div>
  )
}
