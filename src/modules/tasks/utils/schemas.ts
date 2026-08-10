import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['Dusuk', 'Orta', 'Yuksek']),
  departmentId: z.string().optional(),
  projectId: z.string().optional(),
  dueDate: z.string().optional().nullable(),
})

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['Dusuk', 'Orta', 'Yuksek']),
  departmentId: z.string().optional(),
  projectId: z.string().optional(),
  dueDate: z.string().optional().nullable(),
})

export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>
