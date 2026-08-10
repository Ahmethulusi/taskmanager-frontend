import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getStatusColor } from '@/lib/statusColors'
import { getPriorityDisplay } from '@/modules/tasks/utils/taskDisplay'
import type { SortDirection, SortField } from '@/modules/tasks/utils/taskFilters'
import type { TaskDto } from '@/modules/tasks/utils/types'

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const PRIORITY_BADGE_CLASSES: Record<string, string> = {
  low: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  unknown: 'bg-muted text-muted-foreground',
}

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}

function sortIndicator(active: boolean, direction: SortDirection) {
  if (!active) return null
  return direction === 'asc' ? ' ▲' : ' ▼'
}

interface TaskListViewProps {
  tasks: TaskDto[]
  sortField: SortField
  sortDirection: SortDirection
  onSortChange: (field: 'priority' | 'createdAt') => void
}

export function TaskListView({ tasks, sortField, sortDirection, onSortChange }: TaskListViewProps) {
  if (tasks.length === 0) {
    return <p>Görev bulunamadı</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Başlık</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>
            <button
              type="button"
              className="inline-flex items-center font-medium"
              onClick={() => onSortChange('priority')}
            >
              Öncelik{sortIndicator(sortField === 'priority', sortDirection)}
            </button>
          </TableHead>
          <TableHead>Departman</TableHead>
          <TableHead>Oluşturan / Atanan</TableHead>
          <TableHead>
            <button
              type="button"
              className="inline-flex items-center font-medium"
              onClick={() => onSortChange('createdAt')}
            >
              Oluşturulma Tarihi{sortIndicator(sortField === 'createdAt', sortDirection)}
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const priority = getPriorityDisplay(task.priority)
          const statusColor = getStatusColor(task.statusColorKey)
          return (
            <TableRow key={task.id}>
              <TableCell>{task.title}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: statusColor.dot }}
                  />
                  {task.statusName}
                </span>
              </TableCell>
              <TableCell>
                <Badge label={priority.label} className={PRIORITY_BADGE_CLASSES[priority.variant]} />
              </TableCell>
              <TableCell>{task.departmentName ?? '-'}</TableCell>
              <TableCell>
                {task.createdByUserName}
                {task.assignedUsers?.length
                  ? ` / ${task.assignedUsers.map((user) => user.fullName).join(', ')}`
                  : ''}
              </TableCell>
              <TableCell>{dateFormatter.format(new Date(task.createdAt))}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
