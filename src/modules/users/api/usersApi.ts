import { apiFetch } from '@/lib/apiClient'

export interface UserDto {
  id: string
  fullName: string
  email: string
  role: string
  createdAt: string
}

export function getUsers(): Promise<UserDto[]> {
  return apiFetch<UserDto[]>('/api/users')
}
