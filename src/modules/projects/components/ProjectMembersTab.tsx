import { useState } from 'react'
import { Pencil } from 'lucide-react'

import { UserAvatar } from '@/components/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'
import { getCurrentUserId } from '@/lib/currentUser'
import { ProjectFormDialog } from '@/modules/projects/components/ProjectFormDialog'
import type { ProjectDto } from '@/modules/projects/utils/types'

interface ProjectMembersTabProps {
  project: ProjectDto
}

export function ProjectMembersTab({ project }: ProjectMembersTabProps) {
  const { hasPermission } = useAuth()
  const [editOpen, setEditOpen] = useState(false)

  const currentUserId = getCurrentUserId()
  const myMembership = project.members?.find((member) => member.userId === currentUserId)
  const canManage = hasPermission('projects.manage') || myMembership?.role === 'Owner'
  const members = project.members ?? []

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold">Üyeler</h3>
        {canManage && (
          <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil />
            Düzenle
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henüz üye yok</p>
      ) : (
        <ul className="space-y-2">
          {members.map((member) => (
            <li
              key={member.userId}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
            >
              <UserAvatar name={member.fullName} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm">{member.fullName}</span>
              <Badge variant="secondary" className="text-xs">
                {member.role}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <ProjectFormDialog mode="edit" project={project} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}
