import { z } from 'zod'

export const projectMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['Owner', 'Member']),
})

export const projectSchema = z.object({
  name: z.string().min(1, 'Proje adı zorunludur').max(100),
  description: z.string().max(2000).optional().nullable(),
  iconKey: z.string().optional().nullable(),
  members: z.array(projectMemberSchema).optional(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
