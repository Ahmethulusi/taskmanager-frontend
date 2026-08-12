import { useQuery } from '@tanstack/react-query'

import { getTaskAttachments } from '@/modules/attachments/api/attachmentsApi'

export function useTaskAttachmentsQuery(taskId: string) {
  return useQuery({
    queryKey: ['attachments', taskId],
    queryFn: () => getTaskAttachments(taskId),
    enabled: !!taskId,
  })
}
