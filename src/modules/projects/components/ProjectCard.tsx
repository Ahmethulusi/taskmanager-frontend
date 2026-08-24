import { createElement } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { UserAvatar } from '@/components/UserAvatar'
import { AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/AuthContext'
import { getCurrentUserId } from '@/lib/currentUser'
import { getProjectColor } from '@/lib/projectColors'
import { getProjectIcon } from '@/lib/projectIcons'
import type { ProjectDto } from '@/modules/projects/utils/types'
import type { ProjectStats } from '@/modules/projects/utils/projectStats'

const MAX_VISIBLE_MEMBERS = 4

interface ProjectCardProps {
  project: ProjectDto
  stats: ProjectStats
  onEdit: () => void
  onDelete: () => void
}

export function ProjectCard({ project, stats, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const color = getProjectColor(project.id)

  const currentUserId = getCurrentUserId()
  const myMembership = project.members?.find((member) => member.userId === currentUserId)
  const canManage = hasPermission('projects.manage') || myMembership?.role === 'Owner'

  const members = project.members ?? []
  const visibleMembers = members.slice(0, MAX_VISIBLE_MEMBERS)
  const hiddenMemberCount = members.length - visibleMembers.length

  return (
    <Card
      className="group flex h-60 cursor-pointer flex-col justify-between p-4 transition-colors duration-200 hover:bg-muted"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
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

      <div className="flex flex-col gap-1">
        <h3 className="w-fit origin-left font-heading text-base font-semibold text-foreground transition-transform duration-200 group-hover:scale-110">
          {project.name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description || 'Açıklama yok'}
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{stats.totalCount} görev</span>
          {members.length > 0 && (
            <AvatarGroup>
              {visibleMembers.map((member) => (
                <UserAvatar key={member.userId} name={member.fullName} size="sm" />
              ))}
              {hiddenMemberCount > 0 && (
                <AvatarGroupCount>+{hiddenMemberCount}</AvatarGroupCount>
              )}
            </AvatarGroup>
          )}
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
