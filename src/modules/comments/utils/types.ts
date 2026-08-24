import type { AttachmentDto } from '@/modules/attachments/utils/types'

export interface MentionedUserDto {
  id: number
  fullName: string
}

export interface CommentReactionDto {
  emoji: string
  count: number
  reactedByMe: boolean
}

export interface CommentDto {
  id: string
  taskId: string
  userId: string
  userFullName: string
  content: string
  createdAt: string
  updatedAt: string | null
  attachments: AttachmentDto[]
  reactions: CommentReactionDto[]
  mentionedUsers: MentionedUserDto[]
}
