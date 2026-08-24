import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { SprintStats } from '@/modules/sprints/utils/sprintStats'
import { getSprintStatus, getSprintStatusDisplay } from '@/modules/sprints/utils/sprintStatus'
import type { SprintDto } from '@/modules/sprints/utils/types'

interface SprintCardProps {
  sprint: SprintDto
  stats: SprintStats
  canManage: boolean
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

export function SprintCard({ sprint, stats, canManage, onClick, onEdit, onDelete }: SprintCardProps) {
  const status = getSprintStatus(sprint)
  const statusDisplay = getSprintStatusDisplay(status)

  return (
    <Card
      className="group flex h-44 cursor-pointer flex-col justify-between p-4 transition-colors duration-200 hover:bg-muted"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 truncate font-heading text-base font-semibold text-foreground">
          {sprint.name}
        </h3>

        <div className="flex shrink-0 items-center gap-1">
          <span
            className={cn(
              'inline-flex h-5 w-fit shrink-0 items-center justify-center rounded-4xl px-2 text-xs font-medium whitespace-nowrap',
              statusDisplay.className
            )}
          >
            {statusDisplay.label}
          </span>

          {canManage && (
            <div onClick={(event) => event.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-pointer hover:bg-background dark:hover:bg-card"
                    />
                  }
                >
                  <MoreVertical />
                  <span className="sr-only">İşlemler</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil />
                    Düzenle
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={onDelete}>
                    <Trash2 />
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {stats.completedCount}/{stats.totalCount} görev
          </span>
          <span>{stats.progressPercentage}%</span>
        </div>

        <Progress value={stats.progressPercentage} />

        {stats.overdueCount > 0 && (
          <span className="text-xs font-medium text-destructive">
            {stats.overdueCount} gecikmiş
          </span>
        )}
      </div>
    </Card>
  )
}
