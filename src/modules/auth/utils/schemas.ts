import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'E-posta zorunludur').email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  fullName: z.string().min(1, 'Ad soyad zorunludur'),
  email: z.string().min(1, 'E-posta zorunludur').email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
