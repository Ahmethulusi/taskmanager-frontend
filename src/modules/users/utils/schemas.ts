import { z } from 'zod'

export const userEditSchema = z.object({
  fullName: z.string().min(1, 'Ad soyad zorunludur').max(100),
  email: z.string().min(1, 'E-posta zorunludur').email('Geçerli bir e-posta adresi girin'),
  role: z.enum(['Admin', 'User']),
  departmentIds: z.array(z.string()).optional(),
})

export type UserEditFormValues = z.infer<typeof userEditSchema>

export const userCreateSchema = z.object({
  fullName: z.string().min(1, 'Ad soyad zorunludur').max(100),
  email: z.string().min(1, 'E-posta zorunludur').email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  role: z.enum(['Admin', 'User']),
  departmentIds: z.array(z.string()).optional(),
})

export type UserCreateFormValues = z.infer<typeof userCreateSchema>
