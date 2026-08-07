import { createContext, useContext, useState, type ReactNode } from 'react'

import * as authApi from '@/modules/auth/api/authApi'
import type { AuthResponse } from '@/modules/auth/api/authApi'

interface AuthContextValue {
  user: AuthResponse | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => void
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
    return JSON.parse(storedUser) as AuthResponse
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
