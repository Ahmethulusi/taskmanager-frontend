import { apiFetch } from '@/lib/apiClient'
import type { CommentDto } from '@/modules/comments/utils/types'

export function getComments(taskId: string): Promise<CommentDto[]> {
  return apiFetch<CommentDto[]>(`/api/tasks/${taskId}/comments`)
}

export function createComment(
  taskId: string,
  content: string,
  attachmentIds?: string[],
  mentionedUserIds: number[] = []
): Promise<CommentDto> {
  return apiFetch<CommentDto>(`/api/tasks/${taskId}/comments`, {
    method: 'POST',
    body: { content, attachmentIds, mentionedUserIds },
  })
}

export function updateComment(commentId: string, content: string): Promise<CommentDto> {
  return apiFetch<CommentDto>(`/api/comments/${commentId}`, {
    method: 'PUT',
    body: { content },
  })
}

export function deleteComment(commentId: string): Promise<void> {
  return apiFetch<void>(`/api/comments/${commentId}`, {
    method: 'DELETE',
  })
}

export function toggleReaction(commentId: string, emoji: string): Promise<CommentDto> {
  return apiFetch<CommentDto>(`/api/comments/${commentId}/reactions`, {
    method: 'POST',
    body: { emoji },
  })
}
