import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/lib/AuthContext'

interface ProtectedRouteProps {
  requiredRole?: 'Admin'
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <p>Yükleniyor...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/tasks" replace />
  }

  return <Outlet />
}
