export interface SprintDto {
  id: string
  projectId: string
  name: string
  startDate: string
  endDate: string
  taskCount: number
}

export interface CreateSprintDto {
  name: string
  startDate: string
  endDate: string
}

export interface UpdateSprintDto {
  name: string
  startDate: string
  endDate: string
}
