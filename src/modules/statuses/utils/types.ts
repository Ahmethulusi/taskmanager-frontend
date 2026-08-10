import type { StatusColorKey } from '@/lib/statusColors'

export interface TaskStatusDto {
  id: string
  name: string
  displayOrder: number
  colorKey: StatusColorKey | string
  isDefault: boolean
}

export interface CreateTaskStatusDto {
  name: string
  colorKey: StatusColorKey
  isDefault: boolean
}

export interface UpdateTaskStatusDto {
  name: string
  colorKey: StatusColorKey
  isDefault: boolean
  displayOrder: number
}
