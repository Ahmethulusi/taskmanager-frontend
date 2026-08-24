import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, SquareKanban } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/AuthContext'
import { loginSchema, type LoginFormValues } from '@/modules/auth/utils/schemas'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setError(null)
    try {
      await login(values.email, values.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş yapılamadı')
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
            <CardTitle className="text-xl">Giriş Yap</CardTitle>
            <CardDescription>Devam etmek için hesabınıza giriş yapın.</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <p
                role="alert"
                className="animate-in fade-in-0 slide-in-from-top-1 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@sirket.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  className="h-10"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="animate-in fade-in-0 text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  className="h-10"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="animate-in fade-in-0 text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="animate-spin" />}
                {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Hesabın yok mu?{' '}
              <Link
                to="/register"
                className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
              >
                Kayıt Ol
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
