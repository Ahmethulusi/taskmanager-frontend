import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/lib/AuthContext'
import { useUsersQuery } from '@/modules/users/api/useUsersQuery'
import { DeleteUserDialog } from '@/modules/users/components/DeleteUserDialog'
import { OwnProfileCard } from '@/modules/users/components/OwnProfileCard'
import { UserEditDialog } from '@/modules/users/components/UserEditDialog'
import type { UserDto } from '@/modules/users/utils/types'

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

type OpenDialog = 'create' | 'edit' | 'delete' | null

export function UsersPage() {
  const { user: authUser, hasPermission } = useAuth()
  const { data, isLoading, isError, error } = useUsersQuery()
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const [selected, setSelected] = useState<UserDto | null>(null)

  if (!hasPermission('users.manage')) {
    return <OwnProfileCard />
  }

  function openCreate() {
    setSelected(null)
    setOpenDialog('create')
  }

  function openEdit(user: UserDto) {
    setSelected(user)
    setOpenDialog('edit')
  }

  function openDelete(user: UserDto) {
    setSelected(user)
    setOpenDialog('delete')
  }

  function renderContent() {
    if (isLoading) {
      return <p className="p-4 text-base">Yükleniyor...</p>
    }

    if (isError) {
      return (
        <p className="p-4 text-base text-destructive">
          {error instanceof Error ? error.message : 'Kullanıcılar yüklenemedi'}
        </p>
      )
    }

    const users = data ?? []

    if (users.length === 0) {
      return <p className="p-4 text-base text-muted-foreground">Henüz kullanıcı yok</p>
    }

    return (
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Departmanlar</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
              <TableHead className="w-28 text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = Boolean(authUser && authUser.email === user.email)
              const departmentNames =
                user.departments?.map((department) => department.name).join(', ') || '—'

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.fullName}
                    {isSelf && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">(Siz)</span>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      {user.roles?.length ? (
                        user.roles.map((role) => (
                          <Badge key={role} variant="secondary">
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{departmentNames}</TableCell>
                  <TableCell>{dateFormatter.format(new Date(user.createdAt))}</TableCell>
                  <TableCell className="text-right">
                    {isSelf ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <div className="inline-flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil />
                          <span className="sr-only">Düzenle</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openDelete(user)}
                        >
                          <Trash2 />
                          <span className="sr-only">Sil</span>
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Kullanıcılar"
        actions={
          <Button type="button" size="lg" onClick={openCreate}>
            <Plus />
            Yeni Kullanıcı
          </Button>
        }
      />

      {renderContent()}

      <UserEditDialog
        mode="create"
        open={openDialog === 'create'}
        onOpenChange={(open) => setOpenDialog(open ? 'create' : null)}
      />
      {selected && (
        <>
          <UserEditDialog
            mode="edit"
            user={selected}
            open={openDialog === 'edit'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'edit' : null)
              if (!open) setSelected(null)
            }}
          />
          <DeleteUserDialog
            userId={selected.id}
            open={openDialog === 'delete'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'delete' : null)
              if (!open) setSelected(null)
            }}
          />
        </>
      )}
    </>
  )
}
