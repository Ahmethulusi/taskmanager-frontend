import { useState } from 'react'
import { AlertCircle, Clock } from 'lucide-react'

import { MetricCard } from '@/modules/dashboard/components/MetricCard'
import { getFieldLabel } from '@/modules/activity/utils/fieldLabels'
import { useProjectActivityQuery } from '@/modules/projects/api/useProjectActivityQuery'
import { computeProjectStats } from '@/modules/projects/utils/projectStats'
import type { ProjectActivityItemDto, ProjectDto } from '@/modules/projects/utils/types'
import { useStatusesQuery } from '@/modules/statuses/api/useStatusesQuery'
import { TaskDetailsDialog } from '@/modules/tasks/components/TaskDetailsDialog'
import { getDueUrgencyDisplay } from '@/modules/tasks/utils/dueUrgencyDisplay'
import type { TaskDto } from '@/modules/tasks/utils/types'

const timelineDateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

interface ProjectOverviewTabProps {
  project: ProjectDto
  tasks: TaskDto[]
}

export function ProjectOverviewTab({ project, tasks }: ProjectOverviewTabProps) {
  const { data: statuses } = useStatusesQuery()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const selectedTask = tasks.find((task) => String(task.id) === selectedTaskId) ?? null
  const stats = computeProjectStats(project.id, tasks, statuses ?? [])
  const overdueTasks = tasks.filter((task) => task.isOverdue)
  const upcomingTasks = tasks.filter((task) => task.dueUrgency !== null)
  const {
    data: activity,
    isLoading: activityLoading,
    isError: activityError,
  } = useProjectActivityQuery(project.id)

  function goToTask(taskId: string) {
    setSelectedTaskId(taskId)
  }

  return (
    <>
    <div className="flex flex-col gap-6 py-2">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Toplam" value={stats.totalCount} colorKey="yellow" />
        <MetricCard label="Tamamlanan" value={stats.completedCount} colorKey="green" />
        <MetricCard label="Gecikmiş" value={stats.overdueCount} colorKey="red" />
        <MetricCard label="İlerleme %" value={stats.progressPercentage} colorKey="orange" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TaskMiniList
          title="Gecikmiş Görevler"
          tasks={overdueTasks}
          emptyMessage="Gecikmiş görev yok"
          onTaskClick={goToTask}
          variant="overdue"
        />
        <TaskMiniList
          title="Yaklaşan Görevler"
          tasks={upcomingTasks}
          emptyMessage="Yaklaşan görev yok"
          onTaskClick={goToTask}
          variant="upcoming"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-heading text-base font-semibold">Son Aktiviteler</h3>
        {activityLoading && <p className="text-sm text-muted-foreground">Yükleniyor...</p>}
        {activityError && <p className="text-sm text-destructive">Hareketler yüklenemedi</p>}
        {!activityLoading && !activityError && (activity?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">Henüz hareket yok</p>
        )}
        {!activityLoading && !activityError && activity && activity.length > 0 && (
          <ul className="space-y-2">
            {activity.map((entry, index) => (
              <ProjectActivityRow
                key={`${entry.taskId}-${entry.fieldName}-${entry.createdAt}-${index}`}
                entry={entry}
                onTaskClick={goToTask}
              />
            ))}
          </ul>
        )}
      </div>
    </div>

    {selectedTask && (
      <TaskDetailsDialog
        task={selectedTask}
        open
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null)
        }}
      />
    )}
    </>
  )
}

interface TaskMiniListProps {
  title: string
  tasks: TaskDto[]
  emptyMessage: string
  onTaskClick: (taskId: string) => void
  variant: 'overdue' | 'upcoming'
}

function TaskMiniList({ title, tasks, emptyMessage, onTaskClick, variant }: TaskMiniListProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="space-y-1.5">
          {tasks.map((task) => {
            const urgency = variant === 'upcoming' ? getDueUrgencyDisplay(task.dueUrgency) : null
            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onTaskClick(task.id)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span className="min-w-0 flex-1 truncate">{task.title}</span>
                  {variant === 'overdue' ? (
                    <AlertCircle className="size-3.5 shrink-0 text-destructive" />
                  ) : urgency ? (
                    <span
                      className="flex shrink-0 items-center gap-1 text-xs"
                      style={{ color: urgency.color }}
                    >
                      <Clock className="size-3.5" />
                      {urgency.label}
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

interface ProjectActivityRowProps {
  entry: ProjectActivityItemDto
  onTaskClick: (taskId: string) => void
}

function ProjectActivityRow({ entry, onTaskClick }: ProjectActivityRowProps) {
  const fieldLabel = getFieldLabel(entry.fieldName)
  const isCreated = entry.fieldName === 'Created'

  return (
    <li className="flex flex-col gap-1 rounded-lg border border-border p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          <span className="font-medium">{entry.userFullName}</span>{' '}
          {isCreated ? (
            'görevi oluşturdu'
          ) : (
            <>
              <span className="font-medium">{fieldLabel}</span> alanını değiştirdi
            </>
          )}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {timelineDateFormatter.format(new Date(entry.createdAt))}
        </span>
      </div>
      {!isCreated && (entry.oldValue !== null || entry.newValue !== null) && (
        <p className="text-xs text-muted-foreground">
          {entry.oldValue ?? '—'} → {entry.newValue ?? '—'}
        </p>
      )}
      <button
        type="button"
        className="w-fit text-xs text-primary hover:underline"
        onClick={() => onTaskClick(entry.taskId)}
      >
        {entry.taskTitle}
      </button>
    </li>
  )
}
