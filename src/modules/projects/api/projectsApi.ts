import { apiFetch } from '@/lib/apiClient'
import type {
  CreateProjectDto,
  ProjectActivityItemDto,
  ProjectDto,
  UpdateProjectDto,
} from '@/modules/projects/utils/types'

export type { ProjectDto, CreateProjectDto, UpdateProjectDto, ProjectActivityItemDto }

export function getProjects(): Promise<ProjectDto[]> {
  return apiFetch<ProjectDto[]>('/api/projects')
}

export function getProject(id: string): Promise<ProjectDto> {
  return apiFetch<ProjectDto>(`/api/projects/${id}`)
}

export function getProjectActivity(id: string): Promise<ProjectActivityItemDto[]> {
  return apiFetch<ProjectActivityItemDto[]>(`/api/projects/${id}/activity`)
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
