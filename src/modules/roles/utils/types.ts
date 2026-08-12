export interface PermissionDto {
  id: string
  key: string
  description: string
}

export interface RoleDto {
  id: string
  name: string
  permissions: PermissionDto[]
}

export interface CreateRoleDto {
  name: string
  permissionIds: string[]
}

export interface UpdateRoleDto {
  name: string
  permissionIds: string[]
}
