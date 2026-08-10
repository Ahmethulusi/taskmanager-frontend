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

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mevcut şifre zorunludur'),
    newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır'),
    confirmPassword: z.string().min(6, 'Şifre tekrarı en az 6 karakter olmalıdır'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Yeni şifreler eşleşmiyor',
    path: ['confirmPassword'],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
