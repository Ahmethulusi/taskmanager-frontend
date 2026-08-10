import { apiFetch } from '@/lib/apiClient'
import type {
  CreateLabelDto,
  LabelDto,
  UpdateLabelDto,
} from '@/modules/labels/utils/types'

export type { LabelDto, CreateLabelDto, UpdateLabelDto }

export function getLabels(): Promise<LabelDto[]> {
  return apiFetch<LabelDto[]>('/api/labels')
}

export function createLabel(dto: CreateLabelDto): Promise<LabelDto> {
  return apiFetch<LabelDto>('/api/labels', {
    method: 'POST',
    body: dto,
  })
}

export function updateLabel(id: string, dto: UpdateLabelDto): Promise<LabelDto> {
  return apiFetch<LabelDto>(`/api/labels/${id}`, {
    method: 'PUT',
    body: dto,
  })
}

export function deleteLabel(id: string): Promise<void> {
  return apiFetch<void>(`/api/labels/${id}`, {
    method: 'DELETE',
  })
}
