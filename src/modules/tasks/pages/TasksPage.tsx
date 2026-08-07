import { useState } from 'react'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTasksQuery } from '@/modules/tasks/api/useTasksQuery'
import { TaskFormDialog } from '@/modules/tasks/components/TaskFormDialog'
import {
  filterAndSortTasks,
  type DateFilter,
  type PriorityFilter,
  type SortDirection,
  type SortField,
} from '@/modules/tasks/utils/taskFilters'
import { TaskBoardView } from '@/modules/tasks/views/TaskBoardView'

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

export function TasksPage() {
  const { data, isLoading, isError, error } = useTasksQuery()

  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('default')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

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
    const tasks = filterAndSortTasks(
      data ?? [],
      priorityFilter,
      dateFilter,
      selectedSort.field,
      selectedSort.direction
    )

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="priority-filter" className="text-base">
              Öncelik
            </Label>
            <Select
              items={PRIORITY_OPTIONS}
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}
            >
              <SelectTrigger id="priority-filter" className="h-10 w-44 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-base">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date-filter" className="text-base">
              Tarih
            </Label>
            <Select
              items={DATE_OPTIONS}
              value={dateFilter}
              onValueChange={(value) => setDateFilter(value as DateFilter)}
            >
              <SelectTrigger id="date-filter" className="h-10 w-44 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-base">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sort-option" className="text-base">
              Sırala
            </Label>
            <Select
              items={SORT_OPTIONS}
              value={sortOption}
              onValueChange={(value) => setSortOption(value as SortOption)}
            >
              <SelectTrigger id="sort-option" className="h-10 w-64 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-base">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TaskBoardView tasks={tasks} />
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Görevler"
        actions={
          <Button type="button" size="lg" onClick={() => setCreateDialogOpen(true)}>
            <Plus />
            Yeni Görev
          </Button>
        }
      />

      {renderContent()}

      <TaskFormDialog mode="create" open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </>
  )
}
