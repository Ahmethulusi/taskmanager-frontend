import type { LabelDto } from '@/modules/labels/utils/types'

export interface TaskAssignedUser {
  id: string
  fullName: string
}

export interface TaskDto {
  id: string
  title: string
  description: string | null
  statusId: string
  statusName: string
  statusColorKey: string
  priority: string
  createdAt: string
  updatedAt: string | null
  departmentId: string | null
  departmentName: string | null
  projectId: string | null
  projectName: string | null
  createdByUserId: string
  createdByUserName: string
  assignedUsers: TaskAssignedUser[]
  dueDate: string | null
  labels: LabelDto[]
}
