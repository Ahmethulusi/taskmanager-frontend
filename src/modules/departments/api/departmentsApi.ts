import { apiFetch } from '@/lib/apiClient'
import type { DepartmentDto } from '@/modules/departments/utils/types'

export type { DepartmentDto }

export function getDepartments(): Promise<DepartmentDto[]> {
  return apiFetch<DepartmentDto[]>('/api/departments')
}

export function createDepartment(
  name: string,
  userIds: string[],
  managerId: string | null
): Promise<DepartmentDto> {
  return apiFetch<DepartmentDto>('/api/departments', {
    method: 'POST',
    body: { name, userIds, managerId },
  })
}

export function updateDepartment(
  id: string,
  name: string,
  userIds: string[],
  managerId: string | null
): Promise<DepartmentDto> {
  return apiFetch<DepartmentDto>(`/api/departments/${id}`, {
    method: 'PUT',
    body: { name, userIds, managerId },
  })
}

export function deleteDepartment(id: string): Promise<void> {
  return apiFetch<void>(`/api/departments/${id}`, {
    method: 'DELETE',
  })
}
