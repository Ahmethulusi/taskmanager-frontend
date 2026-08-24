import type { CommentDto, MentionedUserDto } from '@/modules/comments/utils/types'
import type { TaskDto } from '@/modules/tasks/utils/types'

function toMentionedUser(id: string | number, fullName: string): MentionedUserDto | null {
  const numericId = Number(id)
  if (!Number.isFinite(numericId) || !fullName.trim()) {
    return null
  }
  return { id: numericId, fullName }
}

export function getMentionCandidates(
  task: TaskDto,
  comments: CommentDto[]
): MentionedUserDto[] {
  const byId = new Map<number, MentionedUserDto>()

  const creator = toMentionedUser(task.createdByUserId, task.createdByUserName)
  if (creator) {
    byId.set(creator.id, creator)
  }

  for (const user of task.assignedUsers ?? []) {
    const candidate = toMentionedUser(user.id, user.fullName)
    if (candidate) {
      byId.set(candidate.id, candidate)
    }
  }

  for (const comment of comments) {
    const candidate = toMentionedUser(comment.userId, comment.userFullName)
    if (candidate) {
      byId.set(candidate.id, candidate)
    }
  }

  return [...byId.values()]
}
