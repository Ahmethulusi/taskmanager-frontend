import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn, getInitials } from '@/lib/utils'

interface UserAvatarProps {
  name: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function UserAvatar({ name, size = 'default', className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={cn('after:border-transparent', className)}>
      <AvatarFallback className="bg-status-progress-bg font-medium text-primary">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
