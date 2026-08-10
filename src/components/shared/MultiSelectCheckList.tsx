import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface MultiSelectItem {
  id: string
  label: string
}

interface MultiSelectCheckListProps {
  items: MultiSelectItem[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  className?: string
  disabled?: boolean
}

export function MultiSelectCheckList({
  items,
  selectedIds,
  onChange,
  className,
  disabled = false,
}: MultiSelectCheckListProps) {
  function toggle(id: string, checked: boolean) {
    if (checked) {
      onChange(selectedIds.includes(id) ? selectedIds : [...selectedIds, id])
      return
    }
    onChange(selectedIds.filter((selectedId) => selectedId !== id))
  }

  return (
    <div
      className={cn(
        'max-h-48 overflow-y-auto rounded-lg border border-border p-2',
        className
      )}
    >
      {items.length === 0 ? (
        <p className="px-1 py-2 text-sm text-muted-foreground">Seçenek yok</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => {
            const checked = selectedIds.includes(item.id)
            const checkboxId = `multi-select-${item.id}`

            return (
              <li key={item.id}>
                <Label
                  htmlFor={checkboxId}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 font-normal hover:bg-muted/60"
                >
                  <Checkbox
                    id={checkboxId}
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={(next) => toggle(item.id, next === true)}
                  />
                  <span className="text-sm">{item.label}</span>
                </Label>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
