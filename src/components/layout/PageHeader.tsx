import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface PageHeaderProps {
  title: string
  actions?: ReactNode
  backTo?: string
  backLabel?: string
}

export function PageHeader({ title, actions, backTo, backLabel = 'Geri' }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 pl-2">
      <SidebarTrigger className="size-10 [&_svg]:size-5" size="icon" />
      <Separator orientation="vertical" className="h-5 self-auto" />
      {backTo && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-2 text-muted-foreground"
          onClick={() => navigate(backTo)}
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Button>
      )}
      <h1 className="min-w-0 truncate font-heading text-2xl font-bold">{title}</h1>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  )
}
