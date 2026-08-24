import { Navigate, useParams } from 'react-router-dom'

/** `/tasks/:id` linkleri (görev detay Drawer'ı) `?taskId=` mekanizmasına yönlendirilir. */
export function TaskIdRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/tasks?taskId=${id}`} replace />
}
