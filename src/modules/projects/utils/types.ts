export type ProjectMemberRole = 'Owner' | 'Member'

export interface ProjectMemberDto {
  userId: string
  fullName: string
  role: ProjectMemberRole
}

export interface ProjectDto {
  id: string
  name: string
  description: string | null
  iconKey: string
  createdAt: string
  members: ProjectMemberDto[]
}

export interface ProjectMemberInput {
  userId: string
  role: ProjectMemberRole
}

export interface CreateProjectDto {
  name: string
  description: string | null
  iconKey: string | null
  members: ProjectMemberInput[]
}

export interface UpdateProjectDto {
  name: string
  description: string | null
  iconKey: string | null
  members: ProjectMemberInput[]
}
