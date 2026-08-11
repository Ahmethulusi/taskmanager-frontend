export interface ActivityLogDto {
  id: string
  userId: string
  userFullName: string
  fieldName: string
  oldValue: string | null
  newValue: string | null
  createdAt: string
}
