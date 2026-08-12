import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteRoleDialog } from '@/modules/roles/components/DeleteRoleDialog'
import { RoleFormDialog } from '@/modules/roles/components/RoleFormDialog'
import { useRolesQuery } from '@/modules/roles/api/useRolesQuery'
import type { RoleDto } from '@/modules/roles/utils/types'

type OpenDialog = 'create' | 'edit' | 'delete' | null

export function RolesPage() {
  const { data, isLoading, isError, error } = useRolesQuery()
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const [selected, setSelected] = useState<RoleDto | null>(null)

  function openCreate() {
    setSelected(null)
    setOpenDialog('create')
  }

  function openEdit(role: RoleDto) {
    setSelected(role)
    setOpenDialog('edit')
  }

  function openDelete(role: RoleDto) {
    setSelected(role)
    setOpenDialog('delete')
  }

  function renderContent() {
    if (isLoading) {
      return <p className="p-4 text-base">Yükleniyor...</p>
    }

    if (isError) {
      return (
        <p className="p-4 text-base text-destructive">
          {error instanceof Error ? error.message : 'Roller yüklenemedi'}
        </p>
      )
    }

    const roles = data ?? []

    if (roles.length === 0) {
      return <p className="p-4 text-base text-muted-foreground">Henüz rol yok</p>
    }

    return (
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>İzin Sayısı</TableHead>
              <TableHead className="w-28 text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.permissions?.length ?? 0}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => openEdit(role)}>
                      <Pencil />
                      <span className="sr-only">Düzenle</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openDelete(role)}
                    >
                      <Trash2 />
                      <span className="sr-only">Sil</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Roller"
        actions={
          <Button type="button" size="lg" onClick={openCreate}>
            <Plus />
            Yeni Rol
          </Button>
        }
      />

      {renderContent()}

      <RoleFormDialog
        mode="create"
        open={openDialog === 'create'}
        onOpenChange={(open) => setOpenDialog(open ? 'create' : null)}
      />
      {selected && (
        <>
          <RoleFormDialog
            mode="edit"
            role={selected}
            open={openDialog === 'edit'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'edit' : null)
              if (!open) setSelected(null)
            }}
          />
          <DeleteRoleDialog
            roleId={selected.id}
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
