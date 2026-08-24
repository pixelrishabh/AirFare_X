import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useAuthStore } from '@/stores/auth-store'
import { hasRouteAccess } from '@/config/permissions'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const user = useAuthStore((state) => state.user)
  const currentRole = user?.role || 'VIEWER'

  // Dynamically filter navigation groups and items based on authenticated user's role
  const filteredNavGroups = sidebarData.navGroups
    .map((group) => {
      if (group.roles && !group.roles.includes(currentRole)) {
        return null
      }

      const filteredItems = group.items.filter((item) => {
        if (item.roles && !item.roles.includes(currentRole)) {
          return false
        }
        if (item.url) {
          return hasRouteAccess(currentRole, item.url as string)
        }
        return true
      })

      if (filteredItems.length === 0) {
        return null
      }

      return {
        ...group,
        items: filteredItems,
      }
    })
    .filter(Boolean) as typeof sidebarData.navGroups

  const currentUserData = {
    name: user?.name || sidebarData.user.name,
    email: user?.email || sidebarData.user.email,
    avatar: sidebarData.user.avatar,
  }

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUserData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}