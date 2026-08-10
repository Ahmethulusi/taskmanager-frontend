import { z } from 'zod'

export const statusSchema = z.object({
  name: z.string().min(1, 'Durum adı zorunludur').max(50),
  colorKey: z.enum(['gray', 'yellow', 'orange', 'green', 'blue', 'purple']),
  isDefault: z.boolean(),
})

export type StatusFormValues = z.infer<typeof statusSchema>
