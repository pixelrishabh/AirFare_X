import { redirect } from '@tanstack/react-router'
import { useAuthStore, type Role } from '@/stores/auth-store'
import { hasRouteAccess } from '@/config/permissions'

export function requireRole(allowedRoles: Role[], targetPath?: string) {
  const { user } = useAuthStore.getState()
  
  if (!user) {
    throw redirect({
      to: '/sign-in',
      search: { redirect: targetPath || '/' },
    })
  }

  if (targetPath && !hasRouteAccess(user.role, targetPath)) {
    throw redirect({
      to: '/403',
    })
  }

  if (!allowedRoles.includes(user.role)) {
    throw redirect({
      to: '/403',
    })
  }
}