import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GlobalSearchDialog } from '@/modules/search/components/GlobalSearchDialog'

export function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar onSearchClick={() => setSearchOpen(true)} />
        <SidebarInset className="flex h-svh min-w-0 flex-col overflow-x-hidden">
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </TooltipProvider>
  )
}
