import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Loader2, SquareKanban } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/AuthContext'
import * as authApi from '@/modules/auth/api/authApi'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/modules/auth/utils/schemas'

export function ChangePasswordPage() {
  const { updateMustChangePassword } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    setError(null)
    try {
      await authApi.changePassword(values.currentPassword, values.newPassword)
      updateMustChangePassword(false)
      navigate('/tasks')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şifre değiştirilemedi')
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-status-progress-bg via-background to-status-pending-bg p-4">
      <div className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <SquareKanban className="size-7" />
          </div>
          <span className="font-heading text-2xl font-bold text-primary">TaskManager</span>
        </div>

        <Card className="shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle className="text-xl">Şifre Değiştir</CardTitle>
            <CardDescription>
              Devam etmek için şifrenizi güncelleyin.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <p
                role="alert"
                className="mb-5 animate-in fade-in-0 slide-in-from-top-1 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.currentPassword)}
                  className="h-10"
                  {...register('currentPassword')}
                />
                {errors.currentPassword && (
                  <p className="animate-in fade-in-0 text-xs text-destructive">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.newPassword)}
                  className="h-10"
                  {...register('newPassword')}
                />
                {errors.newPassword && (
                  <p className="animate-in fade-in-0 text-xs text-destructive">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className="h-10"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="animate-in fade-in-0 text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="animate-spin" />}
                {isSubmitting ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
