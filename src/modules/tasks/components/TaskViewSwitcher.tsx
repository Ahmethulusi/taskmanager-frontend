import { CalendarDays, Columns3, List } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TaskViewMode } from '@/modules/tasks/utils/viewMode'

const VIEW_OPTIONS: {
  value: TaskViewMode
  label: string
  icon: typeof Columns3
}[] = [
  { value: 'calendar', label: 'Takvim', icon: CalendarDays },
  { value: 'board', label: 'Pano', icon: Columns3 },
  { value: 'list', label: 'Liste', icon: List },
]

interface TaskViewSwitcherProps {
  value: TaskViewMode
  onChange: (mode: TaskViewMode) => void
  className?: string
}

export function TaskViewSwitcher({ value, onChange, className }: TaskViewSwitcherProps) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center rounded-md border border-border bg-background p-0.5 shadow-xs',
        className
      )}
      role="group"
      aria-label="Görünüm"
    >
      {VIEW_OPTIONS.map((option) => {
        const Icon = option.icon
        const isActive = value === option.value
        return (
          <Button
            key={option.value}
            type="button"
            variant={isActive ? 'default' : 'ghost'}
            size="icon-sm"
            className={cn('size-9', !isActive && 'text-muted-foreground')}
            aria-label={option.label}
            aria-pressed={isActive}
            title={option.label}
            onClick={() => onChange(option.value)}
          >
            <Icon className="size-4" />
          </Button>
        )
      })}
    </div>
  )
}
