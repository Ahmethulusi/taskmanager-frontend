import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/lib/AuthContext'

interface ProtectedRouteProps {
  requiredPermission?: string
}

export function ProtectedRoute({ requiredPermission }: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useAuth()
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

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/tasks" replace />
  }

  return <Outlet />
}
