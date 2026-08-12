import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import * as authApi from '@/modules/auth/api/authApi'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/modules/auth/utils/schemas'
import { useOwnProfileQuery } from '@/modules/users/api/useOwnProfileQuery'
import { useUpdateOwnProfileMutation } from '@/modules/users/api/useUpdateOwnProfileMutation'
import { ownProfileSchema, type OwnProfileFormValues } from '@/modules/users/utils/schemas'

export function OwnProfileCard() {
  const { data: profile, isLoading, isError, error } = useOwnProfileQuery()

  return (
    <div className="flex justify-center p-4">
      <div className="flex w-full max-w-xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profilim</CardTitle>
          </CardHeader>

          {isLoading && <CardContent>Yükleniyor...</CardContent>}

          {isError && (
            <CardContent className="text-destructive">
              {error instanceof Error ? error.message : 'Profil yüklenemedi'}
            </CardContent>
          )}

          {profile && <OwnProfileForm fullName={profile.fullName} email={profile.email} />}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Şifre Değiştir</CardTitle>
          </CardHeader>
          <ChangePasswordSection />
        </Card>
      </div>
    </div>
  )
}

interface OwnProfileFormProps {
  fullName: string
  email: string
}

function OwnProfileForm({ fullName, email }: OwnProfileFormProps) {
  const { mutateAsync, isPending } = useUpdateOwnProfileMutation()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OwnProfileFormValues>({
    resolver: zodResolver(ownProfileSchema),
    defaultValues: { fullName, email },
  })

  useEffect(() => {
    reset({ fullName, email })
  }, [fullName, email, reset])

  async function onSubmit(values: OwnProfileFormValues) {
    setError(null)
    setSuccess(false)
    try {
      await mutateAsync(values)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profil güncellenemedi')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <CardContent>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-primary">Profil güncellendi</p>}

        <div className="flex flex-col gap-2">
          <Label htmlFor="own-profile-fullName">Ad Soyad</Label>
          <Input id="own-profile-fullName" {...register('fullName')} />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="own-profile-email">E-posta</Label>
          <Input id="own-profile-email" type="email" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </CardContent>

      <CardFooter>
        <Button type="submit" disabled={isPending}>
          Kaydet
        </Button>
      </CardFooter>
    </form>
  )
}

function ChangePasswordSection() {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    setError(null)
    setSuccess(false)
    try {
      await authApi.changePassword(values.currentPassword, values.newPassword)
      setSuccess(true)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şifre değiştirilemedi')
    }
  }

  if (!isOpen) {
    return (
      <CardFooter>
        <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
          <KeyRound />
          Şifre Değiştir
        </Button>
      </CardFooter>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <CardContent>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-primary">Şifre başarıyla değiştirildi</p>}

        <div className="flex flex-col gap-2">
          <Label htmlFor="own-profile-currentPassword">Mevcut Şifre</Label>
          <Input
            id="own-profile-currentPassword"
            type="password"
            autoComplete="current-password"
            {...register('currentPassword')}
          />
          {errors.currentPassword && (
            <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="own-profile-newPassword">Yeni Şifre</Label>
          <Input
            id="own-profile-newPassword"
            type="password"
            autoComplete="new-password"
            {...register('newPassword')}
          />
          {errors.newPassword && (
            <p className="text-xs text-destructive">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="own-profile-confirmPassword">Yeni Şifre (Tekrar)</Label>
          <Input
            id="own-profile-confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button type="submit" disabled={isSubmitting}>
          Şifreyi Güncelle
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsOpen(false)
            setError(null)
            setSuccess(false)
            reset()
          }}
        >
          Vazgeç
        </Button>
      </CardFooter>
    </form>
  )
}
