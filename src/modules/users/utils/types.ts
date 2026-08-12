export interface UserDepartmentSummary {
  id: string
  name: string
}

export interface UserDto {
  id: string
  fullName: string
  email: string
  role: 'Admin' | 'User' | string
  roles: string[]
  createdAt: string
  departments: UserDepartmentSummary[]
}

export interface UpdateUserDto {
  fullName: string
  email: string
  roleIds: string[]
  departmentIds: string[]
}

export interface CreateUserDto {
  fullName: string
  email: string
  password: string
  roleIds: string[]
  departmentIds: string[]
}
