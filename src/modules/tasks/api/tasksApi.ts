import { apiFetch } from '@/lib/apiClient'
import type { TaskDto } from '@/modules/tasks/utils/types'

export function getTasks(): Promise<TaskDto[]> {
  return apiFetch<TaskDto[]>('/api/tasks')
}

export function updateTaskStatus(taskId: string, statusId: string): Promise<TaskDto> {
  return apiFetch<TaskDto>(`/api/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: { statusId },
  })
}

export interface CreateTaskDto {
  title: string
  description: string | null
  priority: string
  departmentId?: string | null
  projectId?: string | null
  assignedUserIds: string[]
  dueDate: string | null
}

export interface UpdateTaskDto {
  title: string
  description: string | null
  priority: string
  departmentId?: string | null
  projectId?: string | null
  dueDate: string | null
}

export function createTask(dto: CreateTaskDto): Promise<TaskDto> {
  return apiFetch<TaskDto>('/api/tasks', {
    method: 'POST',
    body: dto,
  })
}

export function updateTask(taskId: string, dto: UpdateTaskDto): Promise<TaskDto> {
  return apiFetch<TaskDto>(`/api/tasks/${taskId}`, {
    method: 'PUT',
    body: dto,
  })
}

export function deleteTask(taskId: string): Promise<void> {
  return apiFetch<void>(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  })
}

export function assignTask(taskId: string, assignedUserIds: string[]): Promise<TaskDto> {
  return apiFetch<TaskDto>(`/api/tasks/${taskId}/assign`, {
    method: 'PATCH',
    body: { assignedUserIds },
  })
}

export function updateTaskLabels(taskId: string, labelIds: string[]): Promise<TaskDto> {
  return apiFetch<TaskDto>(`/api/tasks/${taskId}/labels`, {
    method: 'PATCH',
    body: { labelIds },
  })
}
