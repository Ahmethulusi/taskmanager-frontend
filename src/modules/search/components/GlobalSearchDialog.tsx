import { useEffect, useRef, useState } from 'react'
import { Building2, CheckSquare, Folder } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useSearchQuery } from '@/modules/search/api/useSearchQuery'
import { addRecentItem, getRecentItems } from '@/modules/search/utils/recentItems'
import type { SearchResultItem, SearchResultType } from '@/modules/search/utils/types'

interface GlobalSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TYPE_ICONS: Record<SearchResultType, typeof CheckSquare> = {
  Task: CheckSquare,
  Project: Folder,
  Department: Building2,
}

const TYPE_GROUP_LABELS: Record<SearchResultType, string> = {
  Task: 'Görevler',
  Project: 'Projeler',
  Department: 'Departmanlar',
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    debounceTimeout.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(debounceTimeout.current)
  }, [query])

  const { data, isFetching } = useSearchQuery(debouncedQuery)

  function reset() {
    setQuery('')
    setDebouncedQuery('')
  }

  function handleSelect(item: SearchResultItem) {
    addRecentItem({ id: item.id, title: item.title, type: item.type })

    if (item.type === 'Task') {
      navigate(`/tasks?taskId=${item.id}`)
    } else if (item.type === 'Project') {
      navigate(`/tasks?projectId=${item.id}`)
    } else {
      navigate('/departments')
    }

    onOpenChange(false)
    reset()
  }

  const showResults = debouncedQuery.length >= 2
  const recentItems = showResults ? [] : getRecentItems()
  const groups: { type: SearchResultType; items: SearchResultItem[] }[] = showResults
    ? [
        { type: 'Task', items: data?.tasks ?? [] },
        { type: 'Project', items: data?.projects ?? [] },
        { type: 'Department', items: data?.departments ?? [] },
      ].filter((group) => group.items.length > 0)
    : []
  const isSearching = showResults && isFetching
  const hasNoResults = showResults && !isFetching && groups.length === 0

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          reset()
        }
      }}
      title="Ara"
      description="Görev, proje ya da departman ara"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Görev, proje ya da departman ara..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isSearching && (
            <div className="py-6 text-center text-sm text-muted-foreground">Aranıyor...</div>
          )}
          {hasNoResults && <CommandEmpty>Sonuç bulunamadı</CommandEmpty>}

          {!showResults && recentItems.length > 0 && (
            <CommandGroup heading="Son Ziyaret Edilenler">
              {recentItems.map((item) => {
                const Icon = TYPE_ICONS[item.type]
                return (
                  <CommandItem
                    key={`${item.type}-${item.id}`}
                    value={`recent-${item.type}-${item.id}-${item.title}`}
                    onSelect={() =>
                      handleSelect({
                        id: item.id,
                        title: item.title,
                        subtitle: null,
                        type: item.type,
                      })
                    }
                  >
                    <Icon />
                    {item.title}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}

          {groups.map((group) => {
            const Icon = TYPE_ICONS[group.type]
            return (
              <CommandGroup key={group.type} heading={TYPE_GROUP_LABELS[group.type]}>
                {group.items.map((item) => (
                  <CommandItem
                    key={`${item.type}-${item.id}`}
                    value={`${item.type}-${item.id}-${item.title}`}
                    onSelect={() => handleSelect(item)}
                  >
                    <Icon />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">{item.title}</span>
                      {item.subtitle && (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )
          })}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
