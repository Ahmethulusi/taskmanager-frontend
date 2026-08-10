import { useState } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { CalendarIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

function parseLocalDate(value: string | null | undefined): Date | undefined {
  if (!value) {
    return undefined
  }

  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) {
    return undefined
  }

  return new Date(year, month - 1, day)
}

function toIsoDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Tarih seçin',
  disabled = false,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseLocalDate(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !selected && 'text-muted-foreground',
              className
            )}
          />
        }
      >
        <CalendarIcon />
        {selected ? format(selected, 'd MMMM yyyy', { locale: tr }) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="z-[100] w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={tr}
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            onChange(date ? toIsoDateString(date) : null)
            setOpen(false)
          }}
        />
        {selected && (
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              <XIcon />
              Tarihi temizle
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
