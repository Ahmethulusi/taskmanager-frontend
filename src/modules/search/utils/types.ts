export type SearchResultType = 'Task' | 'Project' | 'Department'

export interface SearchResultItem {
  id: string
  title: string
  subtitle: string | null
  type: SearchResultType
}

export interface SearchResultsDto {
  tasks: SearchResultItem[]
  projects: SearchResultItem[]
  departments: SearchResultItem[]
}
