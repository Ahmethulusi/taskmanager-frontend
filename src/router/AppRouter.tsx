import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { RegisterPage } from '@/modules/auth/pages/RegisterPage'
import { TasksPage } from '@/modules/tasks/pages/TasksPage'
import { UsersPage } from '@/modules/users/pages/UsersPage'
import { DepartmentsPage } from '@/modules/departments/pages/DepartmentsPage'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { PublicOnlyRoute } from '@/router/PublicOnlyRoute'

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [{ path: '/tasks', element: <TasksPage /> }],
      },
      {
        element: <ProtectedRoute requiredRole="Admin" />,
        children: [
          { path: '/users', element: <UsersPage /> },
          { path: '/departments', element: <DepartmentsPage /> },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/tasks" replace /> },
])
