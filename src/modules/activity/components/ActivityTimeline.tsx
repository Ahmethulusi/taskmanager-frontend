import { useState, type ReactNode } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

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
import { ScrollAreaWithFade } from '@/components/shared/ScrollAreaWithFade'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/AuthContext'
import { getCurrentUserId } from '@/lib/currentUser'
import { useActivityQuery } from '@/modules/activity/api/useActivityQuery'
import { getFieldLabel } from '@/modules/activity/utils/fieldLabels'
import type { ActivityLogDto } from '@/modules/activity/utils/types'
import { useCommentsQuery } from '@/modules/comments/api/useCommentsQuery'
import { useDeleteCommentMutation } from '@/modules/comments/api/useDeleteCommentMutation'
import { useUpdateCommentMutation } from '@/modules/comments/api/useUpdateCommentMutation'
import type { CommentDto } from '@/modules/comments/utils/types'
import { TaskComments } from '@/modules/tasks/components/TaskComments'

const timelineDateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

type TimelineFilter = 'all' | 'comments' | 'activity'

type TimelineItem =
  | { type: 'comment'; createdAt: string; data: CommentDto }
  | { type: 'activity'; createdAt: string; data: ActivityLogDto }

interface ActivityTimelineProps {
  taskId: string
}

export function ActivityTimeline({ taskId }: ActivityTimelineProps) {
  const [filter, setFilter] = useState<TimelineFilter>('all')

  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useCommentsQuery(taskId)
  const {
    data: activity,
    isLoading: activityLoading,
    error: activityError,
  } = useActivityQuery(taskId)

  const isLoading =
    filter === 'all'
      ? commentsLoading || activityLoading
      : filter === 'comments'
        ? commentsLoading
        : activityLoading

  const error =
    filter === 'all'
      ? commentsError ?? activityError
      : filter === 'comments'
        ? commentsError
        : activityError

  const items = buildTimelineItems(filter, comments, activity)

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap gap-2">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          Tümü
        </FilterButton>
        <FilterButton active={filter === 'comments'} onClick={() => setFilter('comments')}>
          Yorumlar
        </FilterButton>
        <FilterButton active={filter === 'activity'} onClick={() => setFilter('activity')}>
          Hareketler
        </FilterButton>
      </div>

      <ScrollAreaWithFade>
        <div className="space-y-3 pb-2">
          {isLoading && (
            <p className="text-sm text-muted-foreground">
              {filter === 'activity' ? 'Hareketler yükleniyor...' : 'Yükleniyor...'}
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : 'Veriler yüklenemedi'}
            </p>
          )}

          {!isLoading && !error && items.length === 0 && (
            <p className="text-sm text-muted-foreground">{getEmptyMessage(filter)}</p>
          )}

          {!isLoading && !error && items.length > 0 && (
            <ul className="space-y-3">
              {items.map((item) =>
                item.type === 'comment' ? (
                  <CommentTimelineItem key={`comment-${item.data.id}`} comment={item.data} taskId={taskId} />
                ) : (
                  <ActivityTimelineItem key={`activity-${item.data.id}`} entry={item.data} />
                )
              )}
            </ul>
          )}
        </div>
      </ScrollAreaWithFade>

      <TaskComments taskId={taskId} />
    </section>
  )
}

function buildTimelineItems(
  filter: TimelineFilter,
  comments: CommentDto[] | undefined,
  activity: ActivityLogDto[] | undefined
): TimelineItem[] {
  if (filter === 'comments') {
    return (comments ?? []).map((comment) => ({
      type: 'comment',
      createdAt: comment.createdAt,
      data: comment,
    }))
  }

  if (filter === 'activity') {
    return (activity ?? []).map((entry) => ({
      type: 'activity',
      createdAt: entry.createdAt,
      data: entry,
    }))
  }

  const merged: TimelineItem[] = [
    ...(comments ?? []).map((comment) => ({
      type: 'comment' as const,
      createdAt: comment.createdAt,
      data: comment,
    })),
    ...(activity ?? []).map((entry) => ({
      type: 'activity' as const,
      createdAt: entry.createdAt,
      data: entry,
    })),
  ]

  return merged.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

function getEmptyMessage(filter: TimelineFilter): string {
  if (filter === 'comments') {
    return 'Henüz yorum yok'
  }
  if (filter === 'activity') {
    return 'Henüz hareket yok'
  }
  return 'Henüz yorum veya hareket yok'
}

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  children: ReactNode
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <Button type="button" variant={active ? 'default' : 'outline'} size="sm" onClick={onClick}>
      {children}
    </Button>
  )
}

interface CommentTimelineItemProps {
  comment: CommentDto
  taskId: string
}

function CommentTimelineItem({ comment, taskId }: CommentTimelineItemProps) {
  const { user } = useAuth()
  const updateMutation = useUpdateCommentMutation()
  const deleteMutation = useDeleteCommentMutation()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const commentId = String(comment.id)
  const currentUserId = getCurrentUserId()
  const isAdmin = user?.role === 'Admin'
  const isOwn = currentUserId !== null && String(comment.userId) === currentUserId
  const isEditing = editingId === commentId

  function startEditing() {
    setActionError(null)
    setEditingId(commentId)
    setEditContent(comment.content)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditContent('')
  }

  async function handleUpdate() {
    const content = editContent.trim()
    if (!content) {
      return
    }
    setActionError(null)
    try {
      await updateMutation.mutateAsync({ commentId, taskId, content })
      cancelEditing()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Yorum güncellenemedi')
    }
  }

  async function handleDelete() {
    if (!pendingDeleteId) {
      return
    }
    setActionError(null)
    try {
      await deleteMutation.mutateAsync({ commentId: pendingDeleteId, taskId })
      setPendingDeleteId(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Yorum silinemedi')
    }
  }

  return (
    <>
      <li className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">{comment.userFullName}</span>
          <span className="text-xs text-muted-foreground">
            {timelineDateFormatter.format(new Date(comment.createdAt))}
          </span>
          {comment.updatedAt && (
            <span className="text-xs text-muted-foreground">(düzenlendi)</span>
          )}

          {(isOwn || isAdmin) && !isEditing && (
            <div className="ml-auto flex items-center gap-1">
              {isOwn && (
                <Button type="button" variant="ghost" size="icon-xs" onClick={startEditing}>
                  <Pencil />
                  <span className="sr-only">Yorumu düzenle</span>
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setActionError(null)
                  setPendingDeleteId(commentId)
                }}
              >
                <Trash2 />
                <span className="sr-only">Yorumu sil</span>
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
              disabled={updateMutation.isPending}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={updateMutation.isPending || !editContent.trim()}
                onClick={handleUpdate}
              >
                Kaydet
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={updateMutation.isPending}
                onClick={cancelEditing}
              >
                Vazgeç
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{comment.content}</p>
        )}

        {actionError && <p className="text-sm text-destructive">{actionError}</p>}
      </li>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bu yorumu silmek istediğine emin misin?</AlertDialogTitle>
            <AlertDialogDescription>Bu işlem geri alınamaz.</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface ActivityTimelineItemProps {
  entry: ActivityLogDto
}

function ActivityTimelineItem({ entry }: ActivityTimelineItemProps) {
  const fieldLabel = getFieldLabel(entry.fieldName)
  const isCreated = entry.fieldName === 'Created'

  return (
    <li className="space-y-0.5 text-sm">
      <p>
        <span className="font-medium">{entry.userFullName}</span>{' '}
        {isCreated ? (
          <>görevi oluşturdu</>
        ) : (
          <>
            {fieldLabel} alanını değiştirdi
          </>
        )}
        <span className="ml-2 text-xs text-muted-foreground">
          {timelineDateFormatter.format(new Date(entry.createdAt))}
        </span>
      </p>
      {!isCreated && (entry.oldValue !== null || entry.newValue !== null) && (
        <p className="text-xs text-muted-foreground">
          {formatActivityValue(entry.oldValue)} → {formatActivityValue(entry.newValue)}
        </p>
      )}
    </li>
  )
}

function formatActivityValue(value: string | null): string {
  if (value === null || value.trim() === '') {
    return '—'
  }
  return value
}
