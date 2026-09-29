import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarTaskChip } from '@/modules/tasks/components/CalendarTaskChip'
import { isSameDay, toDateKey } from '@/modules/tasks/utils/calendarDates'
import type { TaskDto } from '@/modules/tasks/utils/types'

interface CalendarDayCellProps {
  date: Date
  tasks: TaskDto[]
  isCurrentMonth: boolean
  onTaskClick: (task: TaskDto) => void
  onCreateTask?: (date: Date) => void
  maxVisible?: number
  className?: string
}

export function CalendarDayCell({
  date,
  tasks,
  isCurrentMonth,
  onTaskClick,
  onCreateTask,
  maxVisible = 3,
  className,
}: CalendarDayCellProps) {
  const visibleTasks = tasks.slice(0, maxVisible)
  const remainingTasks = tasks.slice(maxVisible)
  const isToday = isSameDay(date, new Date())
  const { setNodeRef, isOver } = useDroppable({ id: toDateKey(date) })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-28 min-w-0 border-r border-b p-1.5 transition-colors',
        !isCurrentMonth && 'bg-muted/30 opacity-55',
        isOver && 'bg-primary/10 opacity-100 ring-2 ring-primary/40 ring-inset',
        className
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-1">
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-full text-xs font-medium',
            isToday && 'bg-orange-600 text-white'
          )}
        >
          {date.getDate()}
        </span>
        {onCreateTask && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-6 shrink-0 cursor-pointer text-primary/40 hover:bg-primary/10 hover:text-primary"
            aria-label="Bu güne görev ekle"
            title="Bu güne görev ekle"
            onClick={(event) => {
              event.stopPropagation()
              onCreateTask(date)
            }}
          >
            <Plus className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="space-y-1">
        {visibleTasks.map((task) => (
          <CalendarTaskChip
            key={String(task.id)}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}

        {remainingTasks.length > 0 && (
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-5 w-full justify-start px-1 text-xs text-muted-foreground"
                />
              }
            >
              +{remainingTasks.length} daha
            </PopoverTrigger>
            <PopoverContent align="start" className="max-h-72 gap-1 overflow-y-auto p-2">
              {remainingTasks.map((task) => (
                <CalendarTaskChip
                  key={String(task.id)}
                  task={task}
                  draggable={false}
                  onClick={() => onTaskClick(task)}
                />
              ))}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}
