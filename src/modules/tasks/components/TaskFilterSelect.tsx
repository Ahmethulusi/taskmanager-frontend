import { Fragment } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface FilterOption<T extends string> {
  value: T
  label: string
}

interface TaskFilterSelectProps<T extends string> {
  id: string
  label: string
  /** İlk seçenek varsayılan ("filtre yok") seçenektir; listede ayraçla ayrılır. */
  options: FilterOption<T>[]
  value: T
  defaultValue: T
  onChange: (value: T) => void
  className?: string
}

export function TaskFilterSelect<T extends string>({
  id,
  label,
  options,
  value,
  defaultValue,
  onChange,
  className,
}: TaskFilterSelectProps<T>) {
  const isActive = value !== defaultValue
  const selected = options.find((option) => option.value === value)

  return (
    <Select
      items={options}
      value={value}
      onValueChange={(next) => onChange((next ?? defaultValue) as T)}
    >
      <SelectTrigger
        id={id}
        aria-label={label}
        className={cn(
          'h-10 max-w-64 cursor-pointer text-sm',
          isActive && 'border-primary/40 bg-primary/5 dark:bg-primary/10',
          className
        )}
      >
        <span className="flex min-w-0 items-center gap-1">
          <span className={cn('shrink-0', isActive && 'text-muted-foreground')}>
            {isActive ? `${label}:` : label}
          </span>
          {isActive && selected && (
            <span className="truncate font-medium text-foreground">{selected.label}</span>
          )}
        </span>
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false} className="w-auto min-w-48">
        {options.map((option, index) => (
          <Fragment key={option.value}>
            <SelectItem value={option.value} className="text-sm">
              {option.label}
            </SelectItem>
            {index === 0 && options.length > 1 && <SelectSeparator />}
          </Fragment>
        ))}
      </SelectContent>
    </Select>
  )
}
