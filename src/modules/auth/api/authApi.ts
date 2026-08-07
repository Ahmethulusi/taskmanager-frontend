import { apiFetch } from '@/lib/apiClient'

export interface AuthResponse {
  token: string
  fullName: string
  email: string
  role: 'Admin' | 'User'
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
