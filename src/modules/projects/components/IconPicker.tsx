import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PROJECT_ICONS } from '@/lib/projectIcons'

interface IconPickerProps {
  selectedKey: string
  onChange: (key: string) => void
}

export function IconPicker({ selectedKey, onChange }: IconPickerProps) {
  return (
    <div className="no-scrollbar max-h-64 overflow-y-auto overflow-x-hidden">
      <div className="grid grid-cols-8 gap-2">
        {Object.entries(PROJECT_ICONS).map(([key, Icon]) => (
          <Button
            key={key}
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              'aspect-square size-auto w-full',
              selectedKey === key && 'border-primary bg-primary/10 text-primary'
            )}
            onClick={() => onChange(key)}
            aria-label={key}
            aria-pressed={selectedKey === key}
          >
            <Icon className="size-5" />
          </Button>
        ))}
      </div>
    </div>
  )
}
