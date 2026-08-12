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
import { cn } from '@/lib/utils'
import { useActivityQuery } from '@/modules/activity/api/useActivityQuery'
import { getFieldLabel } from '@/modules/activity/utils/fieldLabels'
import type { ActivityLogDto } from '@/modules/activity/utils/types'
import { getAttachmentIcon } from '@/modules/attachments/utils/fileIcon'
import type { AttachmentDto } from '@/modules/attachments/utils/types'
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
      <li className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && (
          <span className="px-1 text-xs font-medium text-muted-foreground">
            {comment.userFullName}
          </span>
        )}

        {isEditing ? (
          <div className="w-full max-w-[85%] space-y-2">
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
          <div
            className={cn(
              'max-w-[85%] space-y-1.5 px-3 py-2 text-sm',
              isOwn
                ? 'rounded-2xl rounded-br-sm bg-primary/10 text-foreground'
                : 'rounded-2xl rounded-bl-sm bg-muted text-foreground'
            )}
          >
            <p className="whitespace-pre-wrap">{comment.content}</p>

            {comment.attachments?.length > 0 && (
              <ul className="space-y-1 border-t border-foreground/10 pt-1.5">
                {comment.attachments.map((attachment) => (
                  <li key={String(attachment.id)}>
                    <CommentAttachmentLink attachment={attachment} isOwn={isOwn} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div
          className={cn(
            'flex items-center gap-2 px-1 text-xs text-muted-foreground',
            isOwn && 'flex-row-reverse'
          )}
        >
          <span>{timelineDateFormatter.format(new Date(comment.createdAt))}</span>
          {comment.updatedAt && <span>(düzenlendi)</span>}

          {(isOwn || isAdmin) && !isEditing && (
            <div className="flex items-center gap-0.5">
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
  const currentUserId = getCurrentUserId()
  const isOwn = currentUserId !== null && String(entry.userId) === currentUserId
  const fieldLabel = getFieldLabel(entry.fieldName)
  const isCreated = entry.fieldName === 'Created'

  return (
    <li className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
      {!isOwn && (
        <span className="px-1 text-xs font-medium text-muted-foreground">{entry.userFullName}</span>
      )}

      <div
        className={cn(
          'max-w-[85%] space-y-0.5 px-3 py-2 text-sm',
          isOwn
            ? 'rounded-2xl rounded-br-sm bg-primary/10 text-foreground'
            : 'rounded-2xl rounded-bl-sm bg-muted/80 text-muted-foreground'
        )}
      >
        <p>
          {isOwn ? (
            isCreated ? (
              <>Görevi oluşturdun</>
            ) : (
              <>
                <span className="font-medium">{fieldLabel}</span> alanını değiştirdin
              </>
            )
          ) : isCreated ? (
            <>Görevi oluşturdu</>
          ) : (
            <>
              <span className="font-medium">{fieldLabel}</span> alanını değiştirdi
            </>
          )}
        </p>
        {!isCreated && (entry.oldValue !== null || entry.newValue !== null) && (
          <p className="text-xs opacity-80">
            {formatActivityValue(entry.oldValue)} → {formatActivityValue(entry.newValue)}
          </p>
        )}
      </div>

      <span className="px-1 text-xs text-muted-foreground">
        {timelineDateFormatter.format(new Date(entry.createdAt))}
      </span>
    </li>
  )
}

function formatActivityValue(value: string | null): string {
  if (value === null || value.trim() === '') {
    return '—'
  }
  return value
}

function CommentAttachmentLink({
  attachment,
  isOwn,
}: {
  attachment: AttachmentDto
  isOwn: boolean
}) {
  const Icon = getAttachmentIcon(attachment.contentType)

  return (
    <button
      type="button"
      className={cn(
        'flex min-w-0 items-center gap-1.5 text-xs hover:underline',
        isOwn ? 'text-foreground/80 hover:text-foreground' : 'text-muted-foreground hover:text-foreground'
      )}
      onClick={() => window.open(attachment.downloadUrl, '_blank')}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{attachment.fileName}</span>
    </button>
  )
}
