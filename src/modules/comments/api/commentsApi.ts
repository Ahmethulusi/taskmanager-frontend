import { apiFetch } from '@/lib/apiClient'
import type { CommentDto } from '@/modules/comments/utils/types'

export function getComments(taskId: string): Promise<CommentDto[]> {
  return apiFetch<CommentDto[]>(`/api/tasks/${taskId}/comments`)
}

export function createComment(taskId: string, content: string): Promise<CommentDto> {
  return apiFetch<CommentDto>(`/api/tasks/${taskId}/comments`, {
    method: 'POST',
    body: { content },
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
