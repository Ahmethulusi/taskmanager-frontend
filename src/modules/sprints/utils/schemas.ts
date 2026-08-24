import { z } from 'zod'

export const sprintSchema = z
  .object({
    name: z.string().min(1, 'Sprint adı zorunludur').max(100),
    startDate: z.string().min(1, 'Başlangıç tarihi zorunludur'),
    endDate: z.string().min(1, 'Bitiş tarihi zorunludur'),
  })
  .refine((values) => values.endDate >= values.startDate, {
    message: 'Bitiş tarihi başlangıç tarihinden önce olamaz',
    path: ['endDate'],
  })

export type SprintFormValues = z.infer<typeof sprintSchema>
