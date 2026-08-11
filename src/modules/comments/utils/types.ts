export interface CommentDto {
  id: string
  taskId: string
  userId: string
  userFullName: string
  content: string
  createdAt: string
  updatedAt: string | null
}
