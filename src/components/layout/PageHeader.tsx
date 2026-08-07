import type { ReactNode } from 'react'

import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface PageHeaderProps {
  title: string
  actions?: ReactNode
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 pl-2">
      <SidebarTrigger className="size-10 [&_svg]:size-5" size="icon" />
      <Separator orientation="vertical" className="h-5 self-auto" />
      <h1 className="font-heading text-2xl font-bold">{title}</h1>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  )
}
