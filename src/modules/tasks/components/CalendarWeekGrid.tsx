import { CalendarDayCell } from '@/modules/tasks/components/CalendarDayCell'
import { getWeekDays, toDateKey } from '@/modules/tasks/utils/calendarDates'
import { groupTasksByDueDate } from '@/modules/tasks/utils/groupTasksByDueDate'
import type { TaskDto } from '@/modules/tasks/utils/types'

const WEEKDAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

interface CalendarWeekGridProps {
  anchorDate: Date
  tasks: TaskDto[]
  onTaskClick: (task: TaskDto) => void
  onCreateTask?: (date: Date) => void
}

export function CalendarWeekGrid({
  anchorDate,
  tasks,
  onTaskClick,
  onCreateTask,
}: CalendarWeekGridProps) {
  const days = getWeekDays(anchorDate)
  const tasksByDate = groupTasksByDueDate(tasks)

  return (
    <div className="rounded-md border-t border-l">
      <div className="sticky top-0 z-10 grid grid-cols-7 bg-muted">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={label}
            className="border-r border-b px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {label} {days[index].getDate()}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <CalendarDayCell
            key={toDateKey(day)}
            date={day}
            tasks={tasksByDate[toDateKey(day)] ?? []}
            isCurrentMonth
            maxVisible={7}
            className="min-h-64"
            onTaskClick={onTaskClick}
            onCreateTask={onCreateTask}
          />
        ))}
      </div>
    </div>
  )
}
