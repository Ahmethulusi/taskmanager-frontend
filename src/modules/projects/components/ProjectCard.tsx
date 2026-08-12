import { createElement } from 'react'
import { ListChecks, MoreVertical, Pencil, Trash2, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/AuthContext'
import { getCurrentUserId } from '@/lib/currentUser'
import { getProjectColor } from '@/lib/projectColors'
import { getProjectIcon } from '@/lib/projectIcons'
import type { ProjectDto } from '@/modules/projects/utils/types'

interface ProjectCardProps {
  project: ProjectDto
  taskCount: number
  onEdit: () => void
  onDelete: () => void
}

export function ProjectCard({ project, taskCount, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const color = getProjectColor(project.id)

  const currentUserId = getCurrentUserId()
  const myMembership = project.members?.find((member) => member.userId === currentUserId)
  const canManage = hasPermission('projects.manage') || myMembership?.role === 'Owner'

  return (
    <Card className="group flex h-56 flex-col justify-between p-4 transition-colors duration-200 hover:bg-muted">
      <div className="flex items-start justify-between">
        <div
          className="flex size-10 origin-left items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-115"
          style={{ backgroundColor: color.bg }}
        >
          {createElement(getProjectIcon(project.iconKey), {
            className: 'size-5',
            style: { color: color.accent },
          })}
        </div>

        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer hover:bg-background dark:hover:bg-card"
            onClick={() => navigate(`/tasks?projectId=${project.id}`)}
          >
            <ListChecks />
            <span className="sr-only">Görevleri görüntüle</span>
          </Button>

          {canManage && (
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
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="w-fit origin-left font-heading text-base font-semibold text-foreground transition-transform duration-200 group-hover:scale-110">
          {project.name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description || 'Açıklama yok'}
        </p>
      </div>

      <div className="flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>{taskCount} görev</span>
        <span className="flex items-center gap-1">
          <Users className="size-3.5" />
          {project.members?.length ?? 0} üye
        </span>
      </div>
    </Card>
  )
}
