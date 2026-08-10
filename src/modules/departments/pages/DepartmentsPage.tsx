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
import { useDepartmentsQuery } from '@/modules/departments/api/useDepartmentsQuery'
import { DeleteDepartmentDialog } from '@/modules/departments/components/DeleteDepartmentDialog'
import { DepartmentFormDialog } from '@/modules/departments/components/DepartmentFormDialog'
import type { DepartmentDto } from '@/modules/departments/utils/types'

type OpenDialog = 'create' | 'edit' | 'delete' | null

export function DepartmentsPage() {
  const { data, isLoading, isError, error } = useDepartmentsQuery()
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const [selected, setSelected] = useState<DepartmentDto | null>(null)

  function openCreate() {
    setSelected(null)
    setOpenDialog('create')
  }

  function openEdit(department: DepartmentDto) {
    setSelected(department)
    setOpenDialog('edit')
  }

  function openDelete(department: DepartmentDto) {
    setSelected(department)
    setOpenDialog('delete')
  }

  function renderContent() {
    if (isLoading) {
      return <p className="p-4 text-base">Yükleniyor...</p>
    }

    if (isError) {
      return (
        <p className="p-4 text-base text-destructive">
          {error instanceof Error ? error.message : 'Departmanlar yüklenemedi'}
        </p>
      )
    }

    const departments = data ?? []

    if (departments.length === 0) {
      return <p className="p-4 text-base text-muted-foreground">Henüz departman yok</p>
    }

    return (
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Yönetici</TableHead>
              <TableHead>Kullanıcı Sayısı</TableHead>
              <TableHead className="w-28 text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell>{department.managerName ?? '—'}</TableCell>
                <TableCell>{department.users?.length ?? 0}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(department)}
                    >
                      <Pencil />
                      <span className="sr-only">Düzenle</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openDelete(department)}
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
        title="Departmanlar"
        actions={
          <Button type="button" size="lg" onClick={openCreate}>
            <Plus />
            Yeni Departman
          </Button>
        }
      />

      {renderContent()}

      <DepartmentFormDialog
        mode="create"
        open={openDialog === 'create'}
        onOpenChange={(open) => setOpenDialog(open ? 'create' : null)}
      />
      {selected && (
        <>
          <DepartmentFormDialog
            mode="edit"
            department={selected}
            open={openDialog === 'edit'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'edit' : null)
              if (!open) setSelected(null)
            }}
          />
          <DeleteDepartmentDialog
            departmentId={selected.id}
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
