import { apiFetch } from '@/lib/apiClient'

export interface DepartmentDto {
  id: string
  name: string
}

export function getDepartments(): Promise<DepartmentDto[]> {
  return apiFetch<DepartmentDto[]>('/api/departments')
}
