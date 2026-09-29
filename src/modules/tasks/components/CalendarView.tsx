import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useUpdateTaskDueDateMutation } from '@/modules/tasks/api/useUpdateTaskDueDateMutation'
import { CalendarDayList } from '@/modules/tasks/components/CalendarDayList'
import { CalendarMonthGrid } from '@/modules/tasks/components/CalendarMonthGrid'
import { CalendarTaskChipOverlay } from '@/modules/tasks/components/CalendarTaskChip'
import { CalendarWeekGrid } from '@/modules/tasks/components/CalendarWeekGrid'
import { getWeekDays, toDateKey } from '@/modules/tasks/utils/calendarDates'
import { toApiDueDate } from '@/modules/tasks/utils/dueDate'
import type { TaskDto } from '@/modules/tasks/utils/types'

type CalendarMode = 'month' | 'week' | 'day'

const MODE_OPTIONS: { value: CalendarMode; label: string }[] = [
  { value: 'month', label: 'Ay' },
  { value: 'week', label: 'Hafta' },
  { value: 'day', label: 'Gün' },
]

const monthFormatter = new Intl.DateTimeFormat('tr-TR', {
  month: 'long',
  year: 'numeric',
})

const dayFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const weekStartFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
})

const weekEndFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

interface CalendarViewProps {
  tasks: TaskDto[]
  onTaskClick: (task: TaskDto) => void
  onCreateTask?: (date: Date) => void
}

function getToolbarLabel(mode: CalendarMode, anchorDate: Date): string {
  if (mode === 'month') return monthFormatter.format(anchorDate)
  if (mode === 'day') return dayFormatter.format(anchorDate)

  const weekDays = getWeekDays(anchorDate)
  return `${weekStartFormatter.format(weekDays[0])} – ${weekEndFormatter.format(weekDays[6])}`
}

function shiftAnchorDate(date: Date, mode: CalendarMode, amount: number): Date {
  if (mode === 'month') {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1)
  }

  const shifted = new Date(date)
  shifted.setDate(date.getDate() + amount * (mode === 'week' ? 7 : 1))
  return shifted
}

export function CalendarView({ tasks, onTaskClick, onCreateTask }: CalendarViewProps) {
  const [mode, setMode] = useState<CalendarMode>('month')
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [activeTask, setActiveTask] = useState<TaskDto | null>(null)
  const [dropError, setDropError] = useState<string | null>(null)
  const { mutate: updateDueDate } = useUpdateTaskDueDateMutation()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart(event: DragStartEvent) {
    setDropError(null)
    setActiveTask((event.active.data.current?.task as TaskDto | undefined) ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)

    const task = event.active.data.current?.task as TaskDto | undefined
    const targetDateKey = event.over ? String(event.over.id) : null
    if (!task || !targetDateKey) {
      return
    }
    if (task.dueDate && toDateKey(new Date(task.dueDate)) === targetDateKey) {
      return
    }

    updateDueDate(
      { task, dueDate: toApiDueDate(targetDateKey) ?? targetDateKey },
      {
        onError: (err) => {
          setDropError(err instanceof Error ? err.message : 'Bitiş tarihi güncellenemedi')
        },
      }
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="grid shrink-0 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setAnchorDate((date) => shiftAnchorDate(date, mode, -1))}
          >
            <ChevronLeft />
            <span className="sr-only">Önceki</span>
          </Button>
          <Button type="button" variant="outline" onClick={() => setAnchorDate(new Date())}>
            Bugün
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setAnchorDate((date) => shiftAnchorDate(date, mode, 1))}
          >
            <ChevronRight />
            <span className="sr-only">Sonraki</span>
          </Button>
        </div>

        <h2 className="text-center font-heading text-lg font-semibold capitalize">
          {getToolbarLabel(mode, anchorDate)}
        </h2>

        <div className="flex justify-start gap-2 md:justify-end">
          {MODE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={mode === option.value ? 'default' : 'outline'}
              onClick={() => setMode(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {dropError && <p className="shrink-0 text-sm text-destructive">{dropError}</p>}

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        <div className="no-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          {mode === 'month' && (
            <CalendarMonthGrid
              anchorDate={anchorDate}
              tasks={tasks}
              onTaskClick={onTaskClick}
              onCreateTask={onCreateTask}
            />
          )}
          {mode === 'week' && (
            <CalendarWeekGrid
              anchorDate={anchorDate}
              tasks={tasks}
              onTaskClick={onTaskClick}
              onCreateTask={onCreateTask}
            />
          )}
          {mode === 'day' && (
            <CalendarDayList
              anchorDate={anchorDate}
              tasks={tasks}
              onTaskClick={onTaskClick}
              onCreateTask={onCreateTask}
            />
          )}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask && <CalendarTaskChipOverlay task={activeTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
