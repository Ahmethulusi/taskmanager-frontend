import { z } from 'zod'

export const roleSchema = z.object({
  name: z.string().min(1, 'Rol adı zorunludur').max(50),
  permissionIds: z.array(z.string()).optional(),
})

export type RoleFormValues = z.infer<typeof roleSchema>
