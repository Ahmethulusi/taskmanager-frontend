export interface DepartmentUserSummary {
  id: string
  fullName: string
}

export interface DepartmentDto {
  id: string
  name: string
  users: DepartmentUserSummary[]
  managerId: string | null
  managerName: string | null
}

export interface CreateDepartmentDto {
  name: string
  userIds: string[]
  managerId: string | null
}

export interface UpdateDepartmentDto {
  name: string
  userIds: string[]
  managerId: string | null
}
