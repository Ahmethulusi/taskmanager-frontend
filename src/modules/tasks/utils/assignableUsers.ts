export interface AssignableUserItem {
  id: string
  label: string
}

interface NamedUser {
  id: string | number
  fullName: string
}

interface ProjectMember {
  userId: string | number
  fullName: string
}

/**
 * Assignable users for a task:
 * - project + department → intersection
 * - project only → project members
 * - department only → department users
 * - neither → all workspace users
 */
export function getAssignableUserItems(params: {
  workspaceUsers?: NamedUser[] | null
  projectMembers?: ProjectMember[] | null
  departmentUsers?: NamedUser[] | null
  projectId?: string | null
  departmentId?: string | null
}): AssignableUserItem[] {
  const hasProject = Boolean(params.projectId)
  const hasDepartment = Boolean(params.departmentId)

  if (hasProject) {
    const members = (params.projectMembers ?? []).map((member) => ({
      id: String(member.userId),
      label: member.fullName,
    }))
    if (!hasDepartment) {
      return members
    }
    const departmentUserIds = new Set(
      (params.departmentUsers ?? []).map((user) => String(user.id))
    )
    return members.filter((member) => departmentUserIds.has(member.id))
  }

  if (hasDepartment) {
    return (params.departmentUsers ?? []).map((user) => ({
      id: String(user.id),
      label: user.fullName,
    }))
  }

  return (params.workspaceUsers ?? []).map((user) => ({
    id: String(user.id),
    label: user.fullName,
  }))
}
