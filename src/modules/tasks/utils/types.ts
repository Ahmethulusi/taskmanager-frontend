export interface TaskDto {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  createdAt: string
  updatedAt: string | null
  departmentId: string | null
  departmentName: string | null
  createdByUserId: string
  createdByUserName: string
  assignedToUserId: string | null
  assignedToUserName: string | null
}
