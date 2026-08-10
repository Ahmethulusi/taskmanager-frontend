import { apiFetch } from '@/lib/apiClient'
import type {
  CreateTaskStatusDto,
  TaskStatusDto,
  UpdateTaskStatusDto,
} from '@/modules/statuses/utils/types'

export type { TaskStatusDto, CreateTaskStatusDto, UpdateTaskStatusDto }

export function getStatuses(): Promise<TaskStatusDto[]> {
  return apiFetch<TaskStatusDto[]>('/api/task-statuses')
}

export function createStatus(dto: CreateTaskStatusDto): Promise<TaskStatusDto> {
  return apiFetch<TaskStatusDto>('/api/task-statuses', {
    method: 'POST',
    body: dto,
  })
}

export function updateStatus(id: string, dto: UpdateTaskStatusDto): Promise<TaskStatusDto> {
  return apiFetch<TaskStatusDto>(`/api/task-statuses/${id}`, {
    method: 'PUT',
    body: dto,
  })
}

export function deleteStatus(id: string): Promise<void> {
  return apiFetch<void>(`/api/task-statuses/${id}`, {
    method: 'DELETE',
  })
}
