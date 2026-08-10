import { useState } from 'react'
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2 } from 'lucide-react'

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
import { getStatusColor } from '@/lib/statusColors'
import { useStatusesQuery } from '@/modules/statuses/api/useStatusesQuery'
import { useUpdateStatusMutation } from '@/modules/statuses/api/useUpdateStatusMutation'
import { DeleteStatusDialog } from '@/modules/statuses/components/DeleteStatusDialog'
import { StatusFormDialog } from '@/modules/statuses/components/StatusFormDialog'
import type { TaskStatusDto } from '@/modules/statuses/utils/types'
import type { StatusColorKey } from '@/lib/statusColors'

type OpenDialog = 'create' | 'edit' | 'delete' | null

function toId(value: string | number): string {
  return String(value)
}

function toColorKey(colorKey: string): StatusColorKey {
  const valid: StatusColorKey[] = ['gray', 'yellow', 'orange', 'green', 'blue', 'purple']
  return valid.includes(colorKey as StatusColorKey) ? (colorKey as StatusColorKey) : 'gray'
}

export function StatusesPage() {
  const { data, isLoading, isError, error } = useStatusesQuery()
  const updateMutation = useUpdateStatusMutation()
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const [selected, setSelected] = useState<TaskStatusDto | null>(null)
  const [reorderError, setReorderError] = useState<string | null>(null)

  const statuses = [...(data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder)

  function openCreate() {
    setSelected(null)
    setOpenDialog('create')
  }

  function openEdit(status: TaskStatusDto) {
    setSelected(status)
    setOpenDialog('edit')
  }

  function openDelete(status: TaskStatusDto) {
    setSelected(status)
    setOpenDialog('delete')
  }

  async function moveStatus(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= statuses.length) {
      return
    }

    const current = statuses[index]
    const neighbor = statuses[targetIndex]
    setReorderError(null)

    try {
      await Promise.all([
        updateMutation.mutateAsync({
          id: toId(current.id),
          dto: {
            name: current.name,
            colorKey: toColorKey(current.colorKey),
            isDefault: current.isDefault,
            displayOrder: neighbor.displayOrder,
          },
        }),
        updateMutation.mutateAsync({
          id: toId(neighbor.id),
          dto: {
            name: neighbor.name,
            colorKey: toColorKey(neighbor.colorKey),
            isDefault: neighbor.isDefault,
            displayOrder: current.displayOrder,
          },
        }),
      ])
    } catch (err) {
      setReorderError(err instanceof Error ? err.message : 'Sıra güncellenemedi')
    }
  }

  function renderContent() {
    if (isLoading) {
      return <p className="p-4 text-base">Yükleniyor...</p>
    }

    if (isError) {
      return (
        <p className="p-4 text-base text-destructive">
          {error instanceof Error ? error.message : 'Durumlar yüklenemedi'}
        </p>
      )
    }

    if (statuses.length === 0) {
      return <p className="p-4 text-base text-muted-foreground">Henüz durum yok</p>
    }

    return (
      <div className="p-4">
        {reorderError && <p className="mb-3 text-sm text-destructive">{reorderError}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Renk</TableHead>
              <TableHead>Ad</TableHead>
              <TableHead className="w-28">Varsayılan</TableHead>
              <TableHead className="w-36">Sıra</TableHead>
              <TableHead className="w-28 text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.map((status, index) => {
              const color = getStatusColor(status.colorKey)
              return (
                <TableRow key={toId(status.id)}>
                  <TableCell>
                    <span
                      className="inline-block size-3 rounded-full"
                      style={{ backgroundColor: color.dot }}
                      title={status.colorKey}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{status.name}</TableCell>
                  <TableCell>
                    {status.isDefault ? <Check className="size-4 text-primary" /> : null}
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1">
                      <span className="w-6 text-center tabular-nums">{status.displayOrder}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === 0 || updateMutation.isPending}
                        onClick={() => moveStatus(index, -1)}
                      >
                        <ArrowUp />
                        <span className="sr-only">Yukarı taşı</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === statuses.length - 1 || updateMutation.isPending}
                        onClick={() => moveStatus(index, 1)}
                      >
                        <ArrowDown />
                        <span className="sr-only">Aşağı taşı</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(status)}
                      >
                        <Pencil />
                        <span className="sr-only">Düzenle</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openDelete(status)}
                      >
                        <Trash2 />
                        <span className="sr-only">Sil</span>
                      </Button>
                    </div>
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
        title="Durumlar"
        actions={
          <Button type="button" size="lg" onClick={openCreate}>
            <Plus />
            Yeni Durum
          </Button>
        }
      />

      {renderContent()}

      <StatusFormDialog
        mode="create"
        open={openDialog === 'create'}
        onOpenChange={(open) => setOpenDialog(open ? 'create' : null)}
      />
      {selected && (
        <>
          <StatusFormDialog
            mode="edit"
            status={selected}
            open={openDialog === 'edit'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'edit' : null)
              if (!open) setSelected(null)
            }}
          />
          <DeleteStatusDialog
            statusId={toId(selected.id)}
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
