import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { TasksPage } from '@/modules/tasks/pages/TasksPage'
import { UsersPage } from '@/modules/users/pages/UsersPage'
import { DepartmentsPage } from '@/modules/departments/pages/DepartmentsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/tasks" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'departments', element: <DepartmentsPage /> },
    ],
  },
])
