import { apiFetch } from '@/lib/apiClient'
import type {
  CreateProjectDto,
  ProjectDto,
  UpdateProjectDto,
} from '@/modules/projects/utils/types'

export type { ProjectDto, CreateProjectDto, UpdateProjectDto }

export function getProjects(): Promise<ProjectDto[]> {
  return apiFetch<ProjectDto[]>('/api/projects')
}

export function createProject(dto: CreateProjectDto): Promise<ProjectDto> {
  return apiFetch<ProjectDto>('/api/projects', {
    method: 'POST',
    body: dto,
  })
}

export function updateProject(id: string, dto: UpdateProjectDto): Promise<ProjectDto> {
  return apiFetch<ProjectDto>(`/api/projects/${id}`, {
    method: 'PUT',
    body: dto,
  })
}

export function deleteProject(id: string): Promise<void> {
  return apiFetch<void>(`/api/projects/${id}`, {
    method: 'DELETE',
  })
}
