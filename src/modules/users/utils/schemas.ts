import { z } from 'zod'

export const userEditSchema = z.object({
  fullName: z.string().min(1, 'Ad soyad zorunludur').max(100),
  email: z.string().min(1, 'E-posta zorunludur').email('Geçerli bir e-posta adresi girin'),
  roleIds: z.array(z.string()).min(1, 'En az bir rol seçilmeli'),
})

export type UserEditFormValues = z.infer<typeof userEditSchema>

export const userCreateSchema = z.object({
  fullName: z.string().min(1, 'Ad soyad zorunludur').max(100),
  email: z.string().min(1, 'E-posta zorunludur').email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  roleIds: z.array(z.string()).min(1, 'En az bir rol seçilmeli'),
})

export type UserCreateFormValues = z.infer<typeof userCreateSchema>

export const ownProfileSchema = z.object({
  fullName: z.string().min(1, 'Ad soyad zorunludur').max(100),
  email: z.string().min(1, 'E-posta zorunludur').email('Geçerli bir e-posta adresi girin'),
})

export type OwnProfileFormValues = z.infer<typeof ownProfileSchema>
