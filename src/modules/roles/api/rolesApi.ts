import { apiFetch } from '@/lib/apiClient'
import type {
  CreateRoleDto,
  PermissionDto,
  RoleDto,
  UpdateRoleDto,
} from '@/modules/roles/utils/types'

export type { RoleDto, PermissionDto, CreateRoleDto, UpdateRoleDto }

export function getRoles(): Promise<RoleDto[]> {
  return apiFetch<RoleDto[]>('/api/roles')
}

export function getPermissions(): Promise<PermissionDto[]> {
  return apiFetch<PermissionDto[]>('/api/permissions')
}

export function createRole(dto: CreateRoleDto): Promise<RoleDto> {
  return apiFetch<RoleDto>('/api/roles', {
    method: 'POST',
    body: dto,
  })
}

export function updateRole(id: string, dto: UpdateRoleDto): Promise<RoleDto> {
  return apiFetch<RoleDto>(`/api/roles/${id}`, {
    method: 'PUT',
    body: dto,
  })
}

export function deleteRole(id: string): Promise<void> {
  return apiFetch<void>(`/api/roles/${id}`, {
    method: 'DELETE',
  })
}
