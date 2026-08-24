export const ALLOWED_REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '😮', '👀'] as const

export type AllowedReactionEmoji = (typeof ALLOWED_REACTION_EMOJIS)[number]
