import { useState } from 'react'
import { Plus, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getLabelColor } from '@/lib/labelColors'
import { useCreateLabelMutation } from '@/modules/labels/api/useCreateLabelMutation'
import { useLabelsQuery } from '@/modules/labels/api/useLabelsQuery'
import type { LabelDto } from '@/modules/labels/utils/types'

interface LabelPickerProps {
  selectedLabels: LabelDto[]
  onChange: (labels: LabelDto[]) => void
}

export function LabelPicker({ selectedLabels, onChange }: LabelPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data: labels } = useLabelsQuery()
  const createMutation = useCreateLabelMutation()

  const selectedIds = new Set(selectedLabels.map((label) => String(label.id)))
  const availableLabels =
    labels?.filter((label) => !selectedIds.has(String(label.id))) ?? []

  const trimmedSearch = search.trim()
  const hasExactMatch = (labels ?? []).some(
    (label) => label.name.toLowerCase() === trimmedSearch.toLowerCase()
  )
  const showCreate = trimmedSearch.length > 0 && !hasExactMatch

  function removeLabel(labelId: string) {
    onChange(selectedLabels.filter((label) => String(label.id) !== String(labelId)))
  }

  function addLabel(label: LabelDto) {
    if (selectedIds.has(String(label.id))) {
      return
    }
    onChange([...selectedLabels, label])
  }

  async function handleCreate() {
    if (!showCreate || createMutation.isPending) {
      return
    }
    try {
      const created = await createMutation.mutateAsync({ name: trimmedSearch })
      addLabel(created)
      setSearch('')
    } catch {
      // Error surfaces via disabled/pending state; leave search so user can retry.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {selectedLabels.map((label) => {
        const color = getLabelColor(String(label.id))
        return (
          <Badge
            key={String(label.id)}
            variant="secondary"
            className="gap-1 border-transparent pr-1"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {label.name}
            <button
              type="button"
              className="rounded-full p-0.5 hover:bg-black/10"
              onClick={() => removeLabel(String(label.id))}
              aria-label={`${label.name} etiketini kaldır`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        )
      })}

      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) {
            setSearch('')
          }
        }}
      >
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" size="xs" className="h-6 gap-1 px-2 text-xs" />
          }
        >
          <Plus className="size-3" />
          Etiket Ekle
        </PopoverTrigger>
        <PopoverContent className="z-[100] w-64 p-0" align="start">
          <Command shouldFilter>
            <CommandInput
              placeholder="Etiket ara..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>Etiket bulunamadı</CommandEmpty>
              <CommandGroup>
                {availableLabels.map((label) => (
                  <CommandItem
                    key={String(label.id)}
                    value={label.name}
                    onSelect={() => addLabel(label)}
                  >
                    {label.name}
                  </CommandItem>
                ))}
                {showCreate && (
                  <CommandItem
                    value={trimmedSearch}
                    disabled={createMutation.isPending}
                    onSelect={() => {
                      void handleCreate()
                    }}
                  >
                    {`'${trimmedSearch}' oluştur`}
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
