import { apiFetch } from '@/lib/apiClient'
import type { CreateUserDto, UpdateUserDto, UserDto } from '@/modules/users/utils/types'

export type { UserDto, UpdateUserDto, CreateUserDto }

export function getUsers(): Promise<UserDto[]> {
  return apiFetch<UserDto[]>('/api/users')
}

export function createUser(dto: CreateUserDto): Promise<UserDto> {
  return apiFetch<UserDto>('/api/users', {
    method: 'POST',
    body: dto,
  })
}

export function updateUser(id: string, dto: UpdateUserDto): Promise<UserDto> {
  return apiFetch<UserDto>(`/api/users/${id}`, {
    method: 'PUT',
    body: dto,
  })
}

export function deleteUser(id: string): Promise<void> {
  return apiFetch<void>(`/api/users/${id}`, {
    method: 'DELETE',
  })
}

export function getOwnProfile(): Promise<UserDto> {
  return apiFetch<UserDto>('/api/users/me')
}

export function updateOwnProfile(fullName: string, email: string): Promise<UserDto> {
  return apiFetch<UserDto>('/api/users/me', {
    method: 'PUT',
    body: { fullName, email },
  })
}
