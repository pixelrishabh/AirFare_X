import { redirect } from '@tanstack/react-router'
import { useAuthStore, type Role } from '@/stores/auth-store'

export function requireRole(allowed: Role[], targetPath?: string) {
  const { user } = useAuthStore.getState()
  if (!user || !allowed.includes(user.role)) {
    throw redirect({
      to: '/',
      search: { deniedFrom: targetPath || '/' },
    })
  }
}
