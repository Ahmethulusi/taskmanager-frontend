import { useState } from 'react'
import { SmilePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useToggleReactionMutation } from '@/modules/comments/api/useToggleReactionMutation'
import { ALLOWED_REACTION_EMOJIS } from '@/modules/comments/utils/allowedEmojis'
import type { CommentReactionDto } from '@/modules/comments/utils/types'

interface CommentReactionsProps {
  commentId: string
  taskId: string
  reactions: CommentReactionDto[]
}

export function CommentReactions({ commentId, taskId, reactions }: CommentReactionsProps) {
  const [open, setOpen] = useState(false)
  const toggleMutation = useToggleReactionMutation()
  const visibleReactions = reactions.filter((reaction) => reaction.count > 0)

  function handleToggle(emoji: string) {
    toggleMutation.mutate({ commentId, taskId, emoji })
  }

  return (
    <div className="flex flex-wrap items-center gap-1 pt-1">
      {visibleReactions.map((reaction) => (
        <button
          key={reaction.emoji}
          type="button"
          disabled={toggleMutation.isPending}
          className={cn(
            'inline-flex h-6 items-center gap-1 rounded-full border px-1.5 text-xs',
            reaction.reactedByMe
              ? 'border-primary/30 bg-primary/10'
              : 'border-border bg-background hover:bg-muted'
          )}
          onClick={() => handleToggle(reaction.emoji)}
        >
          <span>{reaction.emoji}</span>
          <span className="text-muted-foreground">{reaction.count}</span>
        </button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={toggleMutation.isPending}
            />
          }
        >
          <SmilePlus />
          <span className="sr-only">Tepki ekle</span>
        </PopoverTrigger>
        <PopoverContent className="z-[100] w-auto p-2" align="start">
          <div className="grid grid-cols-6 gap-0.5">
            {ALLOWED_REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                disabled={toggleMutation.isPending}
                className="flex size-9 items-center justify-center rounded-md text-lg hover:bg-muted"
                onClick={() => {
                  handleToggle(emoji)
                  setOpen(false)
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
