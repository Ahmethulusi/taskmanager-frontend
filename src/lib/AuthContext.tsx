import { createContext, useContext, useState, type ReactNode } from 'react'

import * as authApi from '@/modules/auth/api/authApi'
import type { AuthResponse } from '@/modules/auth/api/authApi'

interface AuthContextValue {
  user: AuthResponse | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateMustChangePassword: (value: boolean) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function persistAuth(auth: AuthResponse) {
  localStorage.setItem('authToken', auth.token)
  localStorage.setItem('authUser', JSON.stringify(auth))
}

function clearPersistedAuth() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('authUser')
}

function readPersistedUser(): AuthResponse | null {
  const token = localStorage.getItem('authToken')
  const storedUser = localStorage.getItem('authUser')
  if (!token || !storedUser) {
    return null
  }
  try {
    const parsed = JSON.parse(storedUser) as Partial<AuthResponse>
    if (!parsed.token || !parsed.email || !parsed.fullName || !parsed.role) {
      clearPersistedAuth()
      return null
    }
    return {
      token: parsed.token,
      fullName: parsed.fullName,
      email: parsed.email,
      role: parsed.role,
      mustChangePassword: parsed.mustChangePassword ?? false,
    }
  } catch {
    clearPersistedAuth()
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(readPersistedUser)
  const [isLoading] = useState(false)

  async function login(email: string, password: string) {
    const auth = await authApi.login(email, password)
    persistAuth(auth)
    setUser(auth)
  }

  async function register(fullName: string, email: string, password: string) {
    const auth = await authApi.register(fullName, email, password)
    persistAuth(auth)
    setUser(auth)
  }

  function logout() {
    clearPersistedAuth()
    setUser(null)
  }

  function updateMustChangePassword(value: boolean) {
    setUser((current) => {
      if (!current) {
        return current
      }
      const updated = { ...current, mustChangePassword: value }
      localStorage.setItem('authUser', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateMustChangePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
