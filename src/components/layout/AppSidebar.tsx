import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Building2,
  FolderKanban,
  ListChecks,
  LogOut,
  ShieldCheck,
  SquareKanban,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { UserAvatar } from '@/components/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/lib/AuthContext'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  permission?: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/tasks', label: 'Görevler', icon: ListChecks },
  { to: '/users', label: 'Kullanıcılar', icon: Users },
  { to: '/departments', label: 'Departmanlar', icon: Building2, permission: 'departments.manage' },
  { to: '/projects', label: 'Projeler', icon: FolderKanban },
  { to: '/statuses', label: 'Durumlar', icon: Tags, permission: 'statuses.manage' },
  { to: '/roles', label: 'Roller', icon: ShieldCheck, permission: 'roles.manage' },
]

export function AppSidebar() {
  const { user, logout, hasPermission } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const items = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission))

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-10 items-center gap-2 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <SquareKanban className="size-6 shrink-0 text-primary" />
          <span className="truncate font-heading text-lg font-bold text-primary group-data-[collapsible=icon]:hidden">
            TaskManager
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {items.map((item) => (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  className="h-11 gap-3 font-heading text-base group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! [&_svg]:size-5"
                  isActive={location.pathname === item.to}
                  tooltip={item.label}
                  render={<NavLink to={item.to} end />}
                >
                  <item.icon />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3">
        {user && (
          <div className="flex items-center gap-2 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <UserAvatar name={user.fullName} />
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <div className="truncate text-sm font-medium text-sidebar-foreground">
                {user.fullName}
              </div>
              <div className="truncate text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          className="group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:self-center group-data-[collapsible=icon]:p-0"
        >
          <LogOut />
          <span className="group-data-[collapsible=icon]:hidden">Çıkış Yap</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
