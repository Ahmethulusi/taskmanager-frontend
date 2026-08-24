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
import { useAssignTaskToSprintMutation } from '@/modules/tasks/api/useAssignTaskToSprintMutation'
import type { TaskDto } from '@/modules/tasks/utils/types'

interface SprintBacklogPickerProps {
  projectId: string
  sprintId: string
  allTasks: TaskDto[]
}

export function SprintBacklogPicker({
  projectId,
  sprintId,
  allTasks,
}: SprintBacklogPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const assignMutation = useAssignTaskToSprintMutation()

  const unassignedTasks = allTasks.filter(
    (task) => String(task.projectId) === String(projectId) && task.sprintId === null
  )
  const normalizedSearch = search.trim().toLocaleLowerCase('tr-TR')
  const visibleTasks = unassignedTasks.filter((task) =>
    task.title.toLocaleLowerCase('tr-TR').includes(normalizedSearch)
  )

  function selectTask(task: TaskDto) {
    assignMutation.mutate({ task, sprintId })
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
            Sprint'e Görev Ekle
          </Button>
        }
      />
      <PopoverContent className="z-[100] w-80 p-0" align="end">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Görev ara..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {unassignedTasks.length === 0
                ? 'Bu projede eklenebilecek görev yok'
                : 'Görev bulunamadı'}
            </CommandEmpty>
            <CommandGroup>
              {visibleTasks.map((task) => (
                <CommandItem
                  key={String(task.id)}
                  value={String(task.id)}
                  disabled={
                    assignMutation.isPending &&
                    String(assignMutation.variables?.task.id) === String(task.id)
                  }
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
