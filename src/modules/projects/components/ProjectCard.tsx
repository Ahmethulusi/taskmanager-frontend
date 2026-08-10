import {
  Briefcase,
  Camera,
  Layers,
  Lightbulb,
  Megaphone,
  MoreVertical,
  Pencil,
  Rocket,
  Sparkles,
  Target,
  Trash2,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getProjectColor } from '@/lib/projectColors'
import type { ProjectDto } from '@/modules/projects/utils/types'

const PROJECT_ICONS = [Rocket, Camera, Megaphone, Briefcase, Layers, Sparkles, Target, Lightbulb]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function renderProjectIcon(projectId: string, className: string, color: string) {
  const hash = hashString(projectId)
  const ProjectIcon = PROJECT_ICONS[hash % PROJECT_ICONS.length]
  return <ProjectIcon className={className} style={{ color }} />
}

interface ProjectCardProps {
  project: ProjectDto
  taskCount: number
  onEdit: () => void
  onDelete: () => void
}

export function ProjectCard({ project, taskCount, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate()
  const color = getProjectColor(project.id)

  return (
    <Card
      onClick={() => navigate(`/tasks?projectId=${project.id}`)}
      className="flex h-56 cursor-pointer flex-col justify-between p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div
          className="flex size-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: color.bg }}
        >
          {renderProjectIcon(project.id, 'size-5', color.accent)}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            }
          >
            <MoreVertical />
            <span className="sr-only">İşlemler</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
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

      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-semibold text-foreground">{project.name}</h3>
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
