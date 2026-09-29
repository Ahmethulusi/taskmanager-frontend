import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'
import { useTasksQuery } from '@/modules/tasks/api/useTasksQuery'
import { CalendarView } from '@/modules/tasks/components/CalendarView'
import { TaskDetailsDialog } from '@/modules/tasks/components/TaskDetailsDialog'
import { TaskFilterSelect, type FilterOption } from '@/modules/tasks/components/TaskFilterSelect'
import { TaskFormDialog } from '@/modules/tasks/components/TaskFormDialog'
import { TaskListView } from '@/modules/tasks/components/TaskListView'
import { TaskViewSwitcher } from '@/modules/tasks/components/TaskViewSwitcher'
import {
  filterAndSortTasks,
  matchesAssigneeFilter,
  matchesDepartmentFilter,
  type AssigneeFilter,
  type DateFilter,
  type DepartmentFilter,
  type PriorityFilter,
  type ProjectFilter,
  type SortDirection,
  type SortField,
} from '@/modules/tasks/utils/taskFilters'
import type { TaskDto } from '@/modules/tasks/utils/types'
import { toDateKey } from '@/modules/tasks/utils/calendarDates'
import type { TaskViewMode } from '@/modules/tasks/utils/viewMode'
import { TaskBoardView } from '@/modules/tasks/views/TaskBoardView'
import { useDepartmentsQuery } from '@/modules/departments/api/useDepartmentsQuery'
import { useProjectsQuery } from '@/modules/projects/api/useProjectsQuery'
import { useStatusesQuery } from '@/modules/statuses/api/useStatusesQuery'

const PRIORITY_OPTIONS: FilterOption<PriorityFilter>[] = [
  { value: 'all', label: 'Tüm öncelikler' },
  { value: 'Dusuk', label: 'Düşük' },
  { value: 'Orta', label: 'Orta' },
  { value: 'Yuksek', label: 'Yüksek' },
]

const DATE_OPTIONS: FilterOption<DateFilter>[] = [
  { value: 'all', label: 'Her zaman' },
  { value: 'today', label: 'Bugün' },
  { value: 'thisWeek', label: 'Bu hafta' },
  { value: 'thisMonth', label: 'Bu ay' },
]

type DueStatusFilter = 'all' | 'overdue' | 'tomorrow' | 'soon'

const DUE_STATUS_OPTIONS: FilterOption<DueStatusFilter>[] = [
  { value: 'all', label: 'Tüm bitiş tarihleri' },
  { value: 'overdue', label: 'Gecikmiş' },
  { value: 'tomorrow', label: 'Yarın bitiyor' },
  { value: 'soon', label: '7 gün içinde bitiyor' },
]

type SortOption =
  | 'default'
  | 'createdAt-desc'
  | 'createdAt-asc'
  | 'priority-desc'
  | 'priority-asc'

const SORT_OPTIONS: (FilterOption<SortOption> & {
  field: SortField
  direction: SortDirection
})[] = [
  { value: 'default', label: 'Varsayılan sıra', field: null, direction: 'asc' },
  { value: 'createdAt-desc', label: 'En yeni önce', field: 'createdAt', direction: 'desc' },
  { value: 'createdAt-asc', label: 'En eski önce', field: 'createdAt', direction: 'asc' },
  { value: 'priority-desc', label: 'Yüksek öncelik önce', field: 'priority', direction: 'desc' },
  { value: 'priority-asc', label: 'Düşük öncelik önce', field: 'priority', direction: 'asc' },
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
  const { data: departments } = useDepartmentsQuery()
  const { hasPermission } = useAuth()
  const canFilterByAssignee = hasPermission('tasks.view.all')

  const [searchParams, setSearchParams] = useSearchParams()
  const projectIdParam = fixedProjectId ? null : searchParams.get('projectId')
  const projectFilter: ProjectFilter = fixedProjectId ?? (projectIdParam ?? 'all')
  const viewMode = parseViewMode(searchParams.get('view'))
  const taskIdParam = searchParams.get('taskId')

  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [dueStatusFilter, setDueStatusFilter] = useState<DueStatusFilter>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>('all')
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>('all')
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

  const effectiveAssigneeFilter: AssigneeFilter = canFilterByAssignee ? assigneeFilter : 'all'
  const hasActiveFilters =
    priorityFilter !== 'all' ||
    dateFilter !== 'all' ||
    dueStatusFilter !== 'all' ||
    effectiveAssigneeFilter !== 'all' ||
    departmentFilter !== 'all' ||
    (!fixedProjectId && projectFilter !== 'all')

  function getDepartmentMemberIds(departmentId: DepartmentFilter): Set<string> {
    const department = departments?.find((item) => String(item.id) === String(departmentId))
    return new Set((department?.users ?? []).map((user) => String(user.id)))
  }

  const departmentMemberIds = getDepartmentMemberIds(departmentFilter)

  function changeDepartmentFilter(value: DepartmentFilter) {
    setDepartmentFilter(value)
    if (
      value !== 'all' &&
      assigneeFilter !== 'all' &&
      assigneeFilter !== 'unassigned' &&
      !getDepartmentMemberIds(value).has(String(assigneeFilter))
    ) {
      setAssigneeFilter('all')
    }
  }

  function clearFilters() {
    setPriorityFilter('all')
    setDateFilter('all')
    setDueStatusFilter('all')
    setAssigneeFilter('all')
    setDepartmentFilter('all')
    if (!fixedProjectId) {
      const next = new URLSearchParams(searchParams)
      next.delete('projectId')
      setSearchParams(next)
    }
  }

  const projectFilterOptions: FilterOption<ProjectFilter>[] = [
    { value: 'all', label: 'Tüm projeler' },
    { value: 'none', label: 'Projesiz' },
    ...(projects?.map((project) => ({
      value: String(project.id) as ProjectFilter,
      label: project.name,
    })) ?? []),
  ]

  const departmentFilterOptions: FilterOption<DepartmentFilter>[] = [
    { value: 'all', label: 'Tüm departmanlar' },
    ...[...(departments ?? [])]
      .sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'))
      .map((department) => ({
        value: String(department.id) as DepartmentFilter,
        label: department.name,
      })),
  ]

  const assigneeNames = new Map<string, string>()
  for (const task of scopedTasks) {
    if (fixedProjectId && String(task.projectId) !== String(fixedProjectId)) continue
    for (const user of task.assignedUsers ?? []) {
      if (departmentFilter !== 'all' && !departmentMemberIds.has(String(user.id))) continue
      assigneeNames.set(String(user.id), user.fullName)
    }
  }
  const assigneeFilterOptions: FilterOption<AssigneeFilter>[] = [
    { value: 'all', label: 'Herkes' },
    { value: 'unassigned', label: 'Atanmamış' },
    ...[...assigneeNames.entries()]
      .sort(([, a], [, b]) => a.localeCompare(b, 'tr-TR'))
      .map(([id, fullName]) => ({ value: id as AssigneeFilter, label: fullName })),
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
    const sourceTasks = scopedTasks.filter((task) => {
      if (!matchesDepartmentFilter(task, departmentFilter, departmentMemberIds)) return false
      if (!matchesAssigneeFilter(task, effectiveAssigneeFilter)) return false
      if (dueStatusFilter === 'all') return true
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
            {hasActiveFilters
              ? 'Seçili filtrelere uyan görev yok'
              : defaultProjectId
                ? 'Bu projede henüz görev yok'
                : 'Görev bulunamadı'}
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
        {!fixedProjectId && (
          <TaskFilterSelect
            id="project-filter"
            label="Proje"
            options={projectFilterOptions}
            value={projectFilter}
            defaultValue="all"
            onChange={setProjectFilter}
          />
        )}

        <TaskFilterSelect
          id="department-filter"
          label="Departman"
          options={departmentFilterOptions}
          value={departmentFilter}
          defaultValue="all"
          onChange={changeDepartmentFilter}
        />

        {canFilterByAssignee && (
          <TaskFilterSelect
            id="assignee-filter"
            label="Atanan"
            options={assigneeFilterOptions}
            value={assigneeFilter}
            defaultValue="all"
            onChange={setAssigneeFilter}
          />
        )}

        <TaskFilterSelect
          id="priority-filter"
          label="Öncelik"
          options={PRIORITY_OPTIONS}
          value={priorityFilter}
          defaultValue="all"
          onChange={setPriorityFilter}
        />

        <TaskFilterSelect
          id="due-status-filter"
          label="Bitiş"
          options={DUE_STATUS_OPTIONS}
          value={dueStatusFilter}
          defaultValue="all"
          onChange={setDueStatusFilter}
        />

        <TaskFilterSelect
          id="date-filter"
          label="Oluşturulma"
          options={DATE_OPTIONS}
          value={dateFilter}
          defaultValue="all"
          onChange={setDateFilter}
        />

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 gap-1 text-muted-foreground"
            onClick={clearFilters}
          >
            <X />
            Filtreleri temizle
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <TaskFilterSelect
            id="sort-option"
            label="Sırala"
            options={SORT_OPTIONS}
            value={sortOption}
            defaultValue="default"
            onChange={setSortOption}
          />
          <TaskViewSwitcher value={viewMode} onChange={setViewMode} />
        </div>

        <Button
          type="button"
          size="lg"
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
