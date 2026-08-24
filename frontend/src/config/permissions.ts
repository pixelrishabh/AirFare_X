import { type Role } from '@/stores/auth-store'

export interface RoutePermission {
  path: string
  roles: Role[]
  title: string
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 3,
  ANALYST: 2,
  VIEWER: 1,
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Viewer + Analyst + Admin (Read-only Intelligence)
  { path: '/', roles: ['VIEWER', 'ANALYST', 'ADMIN'], title: 'Overview' },
  { path: '/airfare-index', roles: ['VIEWER', 'ANALYST', 'ADMIN'], title: 'Airfare Index' },
  { path: '/route-analysis', roles: ['VIEWER', 'ANALYST', 'ADMIN'], title: 'Route Analysis' },
  { path: '/airline-analysis', roles: ['VIEWER', 'ANALYST', 'ADMIN'], title: 'Airline Analysis' },
  { path: '/route-heatmap', roles: ['VIEWER', 'ANALYST', 'ADMIN'], title: 'Route Heatmap' },
  { path: '/lead-time-analysis', roles: ['VIEWER', 'ANALYST', 'ADMIN'], title: 'Lead-Time Analysis' },
  { path: '/data-explorer', roles: ['VIEWER', 'ANALYST', 'ADMIN'], title: 'Data Explorer' },
  { path: '/settings', roles: ['VIEWER', 'ANALYST', 'ADMIN'], title: 'Settings' },
  { path: '/settings/account', roles: ['VIEWER', 'ANALYST', 'ADMIN'], title: 'Account Settings' },
  { path: '/settings/appearance', roles: ['VIEWER', 'ANALYST', 'ADMIN'], title: 'Appearance Settings' },
  { path: '/settings/display', roles: ['VIEWER', 'ANALYST', 'ADMIN'], title: 'Display Settings' },
  { path: '/settings/notifications', roles: ['VIEWER', 'ANALYST', 'ADMIN'], title: 'Notifications' },
  { path: '/help-center', roles: ['VIEWER', 'ANALYST', 'ADMIN'], title: 'Help Center' },

  // Analyst + Admin Only (Analytical & Modeling & API Docs)
  { path: '/backtesting', roles: ['ANALYST', 'ADMIN'], title: 'Backtesting' },
  { path: '/api-docs', roles: ['ANALYST', 'ADMIN'], title: 'API Documentation' },

  // Admin Only (Operational Controls & User Administration)
  { path: '/system-status', roles: ['ADMIN'], title: 'System Status' },
  { path: '/users', roles: ['ADMIN'], title: 'User Management' },
]

export function hasRouteAccess(role: Role | undefined | null, targetPath: string): boolean {
  if (!role) return false
  const cleanPath = targetPath.split('?')[0].replace(/\/$/, '') || '/'

  const rule = ROUTE_PERMISSIONS.find((p) => {
    if (p.path === '/') return cleanPath === '/'
    return cleanPath === p.path || cleanPath.startsWith(p.path + '/')
  })

  if (!rule) {
    return true
  }

  return rule.roles.includes(role)
}

export function getAllowedRolesForRoute(targetPath: string): Role[] {
  const cleanPath = targetPath.split('?')[0].replace(/\/$/, '') || '/'
  const rule = ROUTE_PERMISSIONS.find((p) => {
    if (p.path === '/') return cleanPath === '/'
    return cleanPath === p.path || cleanPath.startsWith(p.path + '/')
  })
  return rule ? rule.roles : ['VIEWER', 'ANALYST', 'ADMIN']
}