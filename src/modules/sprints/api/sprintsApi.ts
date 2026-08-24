import { apiFetch } from '@/lib/apiClient'
import type { CreateSprintDto, SprintDto, UpdateSprintDto } from '@/modules/sprints/utils/types'

export type { SprintDto, CreateSprintDto, UpdateSprintDto }

export function getSprintsForProject(projectId: string): Promise<SprintDto[]> {
  return apiFetch<SprintDto[]>(`/api/projects/${projectId}/sprints`)
}

export function createSprint(projectId: string, dto: CreateSprintDto): Promise<SprintDto> {
  return apiFetch<SprintDto>(`/api/projects/${projectId}/sprints`, {
    method: 'POST',
    body: dto,
  })
}

export function updateSprint(id: string, dto: UpdateSprintDto): Promise<SprintDto> {
  return apiFetch<SprintDto>(`/api/sprints/${id}`, {
    method: 'PUT',
    body: dto,
  })
}

export function deleteSprint(id: string): Promise<void> {
  return apiFetch<void>(`/api/sprints/${id}`, {
    method: 'DELETE',
  })
}
