import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTasksQuery } from '@/modules/tasks/api/useTasksQuery'
import { CalendarView } from '@/modules/tasks/components/CalendarView'
import { TaskDetailsDialog } from '@/modules/tasks/components/TaskDetailsDialog'
import { TaskFormDialog } from '@/modules/tasks/components/TaskFormDialog'
import { TaskListView } from '@/modules/tasks/components/TaskListView'
import { TaskViewSwitcher } from '@/modules/tasks/components/TaskViewSwitcher'
import {
  filterAndSortTasks,
  type DateFilter,
  type PriorityFilter,
  type ProjectFilter,
  type SortDirection,
  type SortField,
} from '@/modules/tasks/utils/taskFilters'
import type { TaskDto } from '@/modules/tasks/utils/types'
import { toDateKey } from '@/modules/tasks/utils/calendarDates'
import type { TaskViewMode } from '@/modules/tasks/utils/viewMode'
import { TaskBoardView } from '@/modules/tasks/views/TaskBoardView'
import { useProjectsQuery } from '@/modules/projects/api/useProjectsQuery'
import { useStatusesQuery } from '@/modules/statuses/api/useStatusesQuery'

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'Dusuk', label: 'Düşük' },
  { value: 'Orta', label: 'Orta' },
  { value: 'Yuksek', label: 'Yüksek' },
]

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'today', label: 'Bugün' },
  { value: 'thisWeek', label: 'Bu Hafta' },
  { value: 'thisMonth', label: 'Bu Ay' },
]

type DueStatusFilter = 'all' | 'overdue' | 'tomorrow' | 'soon'

const DUE_STATUS_OPTIONS: { value: DueStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'overdue', label: 'Gecikmiş' },
  { value: 'tomorrow', label: 'Yarın Bitiyor' },
  { value: 'soon', label: 'Yakında Bitiyor' },
]

type SortOption =
  | 'default'
  | 'createdAt-desc'
  | 'createdAt-asc'
  | 'priority-desc'
  | 'priority-asc'

const SORT_OPTIONS: {
  value: SortOption
  label: string
  field: SortField
  direction: SortDirection
}[] = [
  { value: 'default', label: 'Varsayılan Sıra', field: null, direction: 'asc' },
  {
    value: 'createdAt-desc',
    label: 'Tarihe Göre (Yeni → Eski)',
    field: 'createdAt',
    direction: 'desc',
  },
  {
    value: 'createdAt-asc',
    label: 'Tarihe Göre (Eski → Yeni)',
    field: 'createdAt',
    direction: 'asc',
  },
  {
    value: 'priority-desc',
    label: 'Önceliğe Göre (Yüksek → Düşük)',
    field: 'priority',
    direction: 'desc',
  },
  {
    value: 'priority-asc',
    label: 'Önceliğe Göre (Düşük → Yüksek)',
    field: 'priority',
    direction: 'asc',
  },
]

function parseViewMode(value: string | null): TaskViewMode {
  if (value === 'list' || value === 'calendar' || value === 'board') {
    return value
  }
  return 'calendar'
}

interface TaskWorkspaceProps {
  /** Verildiğinde tüm görevler bu projeye sabitlenir; proje filtresi UI'si gizlenir. */
  fixedProjectId?: string
  /** Verildiğinde tüm görevler ek olarak bu sprint'e sabitlenir. */
  fixedSprintId?: string
}

export function TaskWorkspace({ fixedProjectId, fixedSprintId }: TaskWorkspaceProps) {
  const {
    data,
    isLoading: tasksLoading,
    isError: tasksError,
    error: tasksQueryError,
  } = useTasksQuery()
  const {
    data: statuses,
    isLoading: statusesLoading,
    isError: statusesError,
    error: statusesQueryError,
  } = useStatusesQuery()
  const { data: projects } = useProjectsQuery()

  const [searchParams, setSearchParams] = useSearchParams()
  const projectIdParam = fixedProjectId ? null : searchParams.get('projectId')
  const projectFilter: ProjectFilter = fixedProjectId ?? (projectIdParam ?? 'all')
  const viewMode = parseViewMode(searchParams.get('view'))
  const taskIdParam = searchParams.get('taskId')

  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [dueStatusFilter, setDueStatusFilter] = useState<DueStatusFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('default')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createDueDate, setCreateDueDate] = useState<string | undefined>()
  const [selectedCalendarTask, setSelectedCalendarTask] = useState<TaskDto | null>(null)

  const isLoading = tasksLoading || statusesLoading
  const isError = tasksError || statusesError
  const error = tasksError ? tasksQueryError : statusesQueryError

  const scopedTasks = fixedSprintId
    ? (data ?? []).filter((task) => String(task.sprintId) === String(fixedSprintId))
    : (data ?? [])

  const activeProject = fixedProjectId
    ? undefined
    : projects?.find((project) => String(project.id) === projectIdParam)
  const defaultProjectId =
    fixedProjectId ?? (projectIdParam && projectIdParam !== 'none' ? projectIdParam : undefined)
  const linkedTask = taskIdParam
    ? scopedTasks.find((task) => String(task.id) === taskIdParam)
    : undefined

  function clearTaskIdParam() {
    const next = new URLSearchParams(searchParams)
    next.delete('taskId')
    setSearchParams(next)
  }

  function openCreateDialog(dueDate?: string) {
    setCreateDueDate(dueDate)
    setCreateDialogOpen(true)
  }

  function handleCreateDialogOpenChange(open: boolean) {
    setCreateDialogOpen(open)
    if (!open) {
      setCreateDueDate(undefined)
    }
  }

  function setProjectFilter(value: ProjectFilter) {
    if (value === 'all') {
      const next = new URLSearchParams(searchParams)
      next.delete('projectId')
      setSearchParams(next)
    } else {
      const next = new URLSearchParams(searchParams)
      next.set('projectId', value)
      setSearchParams(next)
    }
  }

  function setViewMode(mode: TaskViewMode) {
    const next = new URLSearchParams(searchParams)
    if (mode === 'calendar') {
      next.delete('view')
    } else {
      next.set('view', mode)
    }
    setSearchParams(next)
  }

  function clearProjectFilter() {
    const next = new URLSearchParams(searchParams)
    next.delete('projectId')
    setSearchParams(next)
  }

  const projectFilterOptions: { value: ProjectFilter; label: string }[] = [
    { value: 'all', label: 'Tümü' },
    { value: 'none', label: 'Projesiz' },
    ...(projects?.map((project) => ({
      value: String(project.id) as ProjectFilter,
      label: project.name,
    })) ?? []),
  ]

  function renderContent() {
    if (isLoading) {
      return <p className="p-4 text-base">Yükleniyor...</p>
    }

    if (isError) {
      return (
        <p className="p-4 text-base text-destructive">
          {error instanceof Error ? error.message : 'Görevler yüklenemedi'}
        </p>
      )
    }

    const selectedSort =
      SORT_OPTIONS.find((option) => option.value === sortOption) ?? SORT_OPTIONS[0]
    const sourceTasks =
      dueStatusFilter === 'all'
        ? scopedTasks
        : scopedTasks.filter((task) => {
            if (dueStatusFilter === 'overdue') return task.isOverdue
            if (dueStatusFilter === 'tomorrow') return task.dueUrgency === 'Tomorrow'
            return task.dueUrgency === 'Soon'
          })
    const tasks = filterAndSortTasks(
      sourceTasks,
      priorityFilter,
      dateFilter,
      projectFilter,
      selectedSort.field,
      selectedSort.direction
    )

    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4">
        {viewMode === 'calendar' ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <CalendarView
              tasks={tasks}
              onTaskClick={setSelectedCalendarTask}
              onCreateTask={(date) => openCreateDialog(toDateKey(date))}
            />
          </div>
        ) : tasks.length === 0 ? (
          <p className="p-4 text-base text-muted-foreground">
            {defaultProjectId ? 'Bu projede henüz görev yok' : 'Görev bulunamadı'}
          </p>
        ) : (
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            {viewMode === 'list' ? (
              <TaskListView tasks={tasks} />
            ) : (
              <TaskBoardView tasks={tasks} statuses={statuses ?? []} />
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-2 px-4 py-2">
        <Select
          items={PRIORITY_OPTIONS}
          value={priorityFilter}
          onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}
        >
          <SelectTrigger id="priority-filter" aria-label="Öncelik" className="h-10 w-36 text-sm">
            <SelectValue placeholder="Öncelik" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-sm">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={DATE_OPTIONS}
          value={dateFilter}
          onValueChange={(value) => setDateFilter(value as DateFilter)}
        >
          <SelectTrigger id="date-filter" aria-label="Tarih" className="h-10 w-36 text-sm">
            <SelectValue placeholder="Tarih" />
          </SelectTrigger>
          <SelectContent>
            {DATE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-sm">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!fixedProjectId && (
          <Select
            items={projectFilterOptions}
            value={projectFilter}
            onValueChange={(value) => setProjectFilter((value ?? 'all') as ProjectFilter)}
          >
            <SelectTrigger id="project-filter" aria-label="Proje" className="h-10 w-44 text-sm">
              <SelectValue placeholder="Proje" />
            </SelectTrigger>
            <SelectContent>
              {projectFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-sm">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          items={SORT_OPTIONS}
          value={sortOption}
          onValueChange={(value) => setSortOption(value as SortOption)}
        >
          <SelectTrigger id="sort-option" aria-label="Sırala" className="h-10 w-56 text-sm">
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-sm">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={DUE_STATUS_OPTIONS}
          value={dueStatusFilter}
          onValueChange={(value) => setDueStatusFilter(value as DueStatusFilter)}
        >
          <SelectTrigger
            id="due-status-filter"
            aria-label="Bitiş Durumu"
            className="h-10 w-44 text-sm"
          >
            <SelectValue placeholder="Bitiş Durumu" />
          </SelectTrigger>
          <SelectContent>
            {DUE_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-sm">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <TaskViewSwitcher value={viewMode} onChange={setViewMode} />

        {activeProject && (
          <Badge variant="secondary" className="h-7 w-fit gap-1.5 px-3 text-sm">
            Proje: {activeProject.name}
            <button
              type="button"
              onClick={clearProjectFilter}
              className="ml-1 rounded-full hover:text-destructive"
            >
              <X className="size-3.5" />
              <span className="sr-only">Proje filtresini temizle</span>
            </button>
          </Badge>
        )}

        <Button
          type="button"
          size="lg"
          className="ml-auto"
          onClick={() => openCreateDialog()}
        >
          <Plus />
          Yeni Görev
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{renderContent()}</div>

      <TaskFormDialog
        mode="create"
        open={createDialogOpen}
        onOpenChange={handleCreateDialogOpenChange}
        defaultProjectId={defaultProjectId}
        defaultSprintId={fixedSprintId}
        defaultDueDate={createDueDate}
      />
      {selectedCalendarTask && (
        <TaskDetailsDialog
          task={selectedCalendarTask}
          open
          onOpenChange={(open) => {
            if (!open) setSelectedCalendarTask(null)
          }}
        />
      )}
      {linkedTask && (
        <TaskDetailsDialog
          task={linkedTask}
          open
          onOpenChange={(open) => {
            if (!open) clearTaskIdParam()
          }}
        />
      )}
    </div>
  )
}
