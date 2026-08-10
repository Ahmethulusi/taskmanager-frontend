export interface UserDepartmentSummary {
  id: string
  name: string
}

export interface UserDto {
  id: string
  fullName: string
  email: string
  role: 'Admin' | 'User' | string
  createdAt: string
  departments: UserDepartmentSummary[]
}

export interface UpdateUserDto {
  fullName: string
  email: string
  role: string
  departmentIds: string[]
}

export interface CreateUserDto {
  fullName: string
  email: string
  password: string
  role: string
  departmentIds: string[]
}
