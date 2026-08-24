import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'

import { Textarea } from '@/components/ui/textarea'
import type { MentionedUserDto } from '@/modules/comments/utils/types'

interface MentionTextareaProps {
  value: string
  onChange: (value: string) => void
  candidates: MentionedUserDto[]
  mentionedIds: number[]
  onMentionedIdsChange: (ids: number[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

interface ActiveMention {
  start: number
  query: string
}

function getActiveMention(value: string, caret: number): ActiveMention | null {
  const before = value.slice(0, caret)
  const match = before.match(/@([^\s@]*)$/)
  if (!match) {
    return null
  }
  return { start: caret - match[0].length, query: match[1] }
}

export function MentionTextarea({
  value,
  onChange,
  candidates,
  mentionedIds,
  onMentionedIdsChange,
  placeholder,
  disabled,
  className,
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [activeMention, setActiveMention] = useState<ActiveMention | null>(null)

  const normalizedQuery = activeMention?.query.toLocaleLowerCase('tr-TR') ?? ''
  const matches =
    activeMention === null
      ? []
      : candidates.filter((candidate) =>
          candidate.fullName.toLocaleLowerCase('tr-TR').includes(normalizedQuery)
        )

  function syncActiveMention(textarea: HTMLTextAreaElement) {
    setActiveMention(getActiveMention(textarea.value, textarea.selectionStart ?? textarea.value.length))
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value)
    syncActiveMention(event.target)
  }

  function insertMention(candidate: MentionedUserDto) {
    if (!activeMention) {
      return
    }

    const tokenEnd = activeMention.start + 1 + activeMention.query.length
    const before = value.slice(0, activeMention.start)
    const after = value.slice(tokenEnd)
    const inserted = `@${candidate.fullName} `
    const next = `${before}${inserted}${after}`

    onChange(next)
    if (!mentionedIds.includes(candidate.id)) {
      onMentionedIdsChange([...mentionedIds, candidate.id])
    }
    setActiveMention(null)

    const cursor = before.length + inserted.length
    const textarea = textareaRef.current
    requestAnimationFrame(() => {
      textarea?.focus()
      textarea?.setSelectionRange(cursor, cursor)
    })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!activeMention || matches.length === 0) {
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setActiveMention(null)
    }
  }

  return (
    <div className="relative">
      {matches.length > 0 && (
        <ul className="absolute bottom-full z-[100] mb-1 max-h-40 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 text-sm shadow-md">
          {matches.map((candidate) => (
            <li key={candidate.id}>
              <button
                type="button"
                className="flex w-full rounded-sm px-2 py-1.5 text-left hover:bg-muted"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insertMention(candidate)}
              >
                {candidate.fullName}
              </button>
            </li>
          ))}
        </ul>
      )}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => syncActiveMention(event.currentTarget)}
        onClick={(event) => syncActiveMention(event.currentTarget)}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
    </div>
  )
}
