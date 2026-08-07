import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/lib/AuthContext'

export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <p>Yükleniyor...</p>
  }

  if (user) {
    return <Navigate to="/tasks" replace />
  }

  return <Outlet />
}
