import { useState } from 'react'
import { Plus } from 'lucide-react'

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
import { useTasksQuery } from '@/modules/tasks/api/useTasksQuery'
import type { TaskDto } from '@/modules/tasks/utils/types'

interface TaskPickerProps {
  excludeTaskIds: number[]
  onSelect: (task: TaskDto) => void
}

export function TaskPicker({ excludeTaskIds, onSelect }: TaskPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data: tasks } = useTasksQuery()
  const excludedIds = new Set(excludeTaskIds)
  const normalizedSearch = search.trim().toLocaleLowerCase('tr-TR')
  const availableTasks = (tasks ?? []).filter(
    (task) =>
      !excludedIds.has(Number(task.id)) &&
      task.title.toLocaleLowerCase('tr-TR').includes(normalizedSearch)
  )

  function selectTask(task: TaskDto) {
    onSelect(task)
    setSearch('')
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setSearch('')
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <Plus />
            Bağımlılık Ekle
          </Button>
        }
      />
      <PopoverContent className="z-[100] w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Görev ara..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Görev bulunamadı</CommandEmpty>
            <CommandGroup>
              {availableTasks.map((task) => (
                <CommandItem
                  key={String(task.id)}
                  value={String(task.id)}
                  onSelect={() => selectTask(task)}
                >
                  <span className="truncate">{task.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
