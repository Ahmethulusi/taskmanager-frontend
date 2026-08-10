import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/lib/AuthContext'

interface ProtectedRouteProps {
  requiredRole?: 'Admin'
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <p>Yükleniyor...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/tasks" replace />
  }

  return <Outlet />
}
