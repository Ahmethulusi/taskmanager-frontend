import { useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ProjectMemberInput, ProjectMemberRole } from '@/modules/projects/utils/types'
import { useUsersQuery } from '@/modules/users/api/useUsersQuery'

const ROLE_OPTIONS: { value: ProjectMemberRole; label: string }[] = [
  { value: 'Owner', label: 'Owner' },
  { value: 'Member', label: 'Member' },
]

function toId(value: string | number): string {
  return String(value)
}

interface ProjectMembersEditorProps {
  members: ProjectMemberInput[]
  onChange: (members: ProjectMemberInput[]) => void
  disabled?: boolean
}

export function ProjectMembersEditor({
  members,
  onChange,
  disabled = false,
}: ProjectMembersEditorProps) {
  const { data: users } = useUsersQuery()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const memberIds = new Set(members.map((member) => toId(member.userId)))
  const availableUsers =
    users?.filter((user) => !memberIds.has(toId(user.id))) ?? []

  function getUserName(userId: string): string {
    const user = users?.find((item) => toId(item.id) === toId(userId))
    return user?.fullName ?? userId
  }

  function updateRole(userId: string, role: ProjectMemberRole) {
    onChange(
      members.map((member) =>
        toId(member.userId) === toId(userId) ? { ...member, role } : member
      )
    )
  }

  function removeMember(userId: string) {
    onChange(members.filter((member) => toId(member.userId) !== toId(userId)))
  }

  function addMember() {
    if (!selectedUserId) {
      return
    }
    onChange([...members, { userId: selectedUserId, role: 'Member' }])
    setSelectedUserId(null)
  }

  return (
    <div className="space-y-3">
      {members.length > 0 && (
        <ul className="space-y-2 rounded-lg border border-border p-2">
          {members.map((member) => (
            <li
              key={toId(member.userId)}
              className="flex items-center gap-2 rounded-md px-1 py-1"
            >
              <span className="min-w-0 flex-1 truncate text-sm">
                {getUserName(member.userId)}
              </span>
              <Select
                items={ROLE_OPTIONS}
                value={member.role}
                onValueChange={(value) => {
                  if (value === 'Owner' || value === 'Member') {
                    updateRole(member.userId, value)
                  }
                }}
                disabled={disabled}
              >
                <SelectTrigger className="h-8 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                onClick={() => removeMember(member.userId)}
              >
                <X />
                <span className="sr-only">Üyeyi kaldır</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        <Label>Üye ekle</Label>
        <div className="flex gap-2">
          <Select
            items={availableUsers.map((user) => ({
              value: toId(user.id),
              label: user.fullName,
            }))}
            value={selectedUserId}
            onValueChange={(value) => setSelectedUserId(value ? toId(value) : null)}
            disabled={disabled || availableUsers.length === 0}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Kullanıcı seçin" />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={toId(user.id)} value={toId(user.id)}>
                  {user.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || !selectedUserId}
            onClick={addMember}
          >
            Ekle
          </Button>
        </div>
        {availableUsers.length === 0 && (
          <p className="text-xs text-muted-foreground">Eklenebilecek kullanıcı kalmadı</p>
        )}
      </div>
    </div>
  )
}
