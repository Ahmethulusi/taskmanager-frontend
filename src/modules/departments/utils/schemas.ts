import { z } from 'zod'

export const departmentSchema = z.object({
  name: z.string().min(1, 'Departman adı zorunludur').max(100),
  userIds: z.array(z.string()).optional(),
})

export type DepartmentFormValues = z.infer<typeof departmentSchema>
