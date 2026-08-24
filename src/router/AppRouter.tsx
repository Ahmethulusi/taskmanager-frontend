import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { ChangePasswordPage } from '@/modules/auth/pages/ChangePasswordPage'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { RegisterPage } from '@/modules/auth/pages/RegisterPage'
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage'
import { TasksPage } from '@/modules/tasks/pages/TasksPage'
import { UsersPage } from '@/modules/users/pages/UsersPage'
import { DepartmentsPage } from '@/modules/departments/pages/DepartmentsPage'
import { ProjectDetailPage } from '@/modules/projects/pages/ProjectDetailPage'
import { ProjectsPage } from '@/modules/projects/pages/ProjectsPage'
import { RolesPage } from '@/modules/roles/pages/RolesPage'
import { StatusesPage } from '@/modules/statuses/pages/StatusesPage'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { PublicOnlyRoute } from '@/router/PublicOnlyRoute'
import { TaskIdRedirect } from '@/router/TaskIdRedirect'

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/change-password', element: <ChangePasswordPage /> }],
  },
  {
    element: <AppLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [{ path: '/dashboard', element: <DashboardPage /> }],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/tasks', element: <TasksPage /> },
          { path: '/tasks/:id', element: <TaskIdRedirect /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [{ path: '/users', element: <UsersPage /> }],
      },
      {
        element: <ProtectedRoute requiredPermission="departments.manage" />,
        children: [{ path: '/departments', element: <DepartmentsPage /> }],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/projects', element: <ProjectsPage /> },
          { path: '/projects/:id', element: <ProjectDetailPage /> },
        ],
      },
      {
        element: <ProtectedRoute requiredPermission="statuses.manage" />,
        children: [{ path: '/statuses', element: <StatusesPage /> }],
      },
      {
        element: <ProtectedRoute requiredPermission="roles.manage" />,
        children: [{ path: '/roles', element: <RolesPage /> }],
      },
    ],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
])
