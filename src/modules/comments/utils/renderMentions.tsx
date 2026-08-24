import type { ReactNode } from 'react'

import type { MentionedUserDto } from '@/modules/comments/utils/types'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function renderCommentContent(
  content: string,
  mentionedUsers: MentionedUserDto[]
): ReactNode {
  const names = [...mentionedUsers]
    .map((user) => user.fullName.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)

  if (!content || names.length === 0) {
    return content
  }

  const pattern = new RegExp(`(${names.map((name) => `@${escapeRegExp(name)}`).join('|')})`, 'g')
  const parts = content.split(pattern)

  return parts.map((part, index) => {
    const isMention = names.some((name) => part === `@${name}`)
    if (isMention) {
      return (
        <span key={index} className="font-medium text-primary">
          {part}
        </span>
      )
    }
    return part
  })
}
