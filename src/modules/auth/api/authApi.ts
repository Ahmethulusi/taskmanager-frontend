import { apiFetch } from '@/lib/apiClient'

export interface AuthResponse {
  token: string
  fullName: string
  email: string
  role: 'Admin' | 'User'
  mustChangePassword: boolean
  permissions: string[]
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function register(
  fullName: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: { fullName, email, password },
  })
}

export function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  return apiFetch<void>('/api/auth/change-password', {
    method: 'POST',
    body: { currentPassword, newPassword },
  })
}
