import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export type Role = 'ADMIN' | 'ANALYST' | 'VIEWER'

export interface User {
  id: string
  email: string
  name: string
  role: Role
}

export interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (token: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
  auth: {
    get user() {
      const u = get().user
      if (!u) return null
      return {
        accountNo: u.id.slice(0, 8),
        email: u.email,
        role: [u.role],
        exp: Date.now() + 24 * 60 * 60 * 1000,
      }
    },
    setUser: (authUser) => {
      if (!authUser) {
        set({ user: null })
      } else {
        const role = (authUser.role?.[0] as Role) || 'VIEWER'
        set({
          user: {
            id: authUser.accountNo || 'usr-1',
            email: authUser.email,
            name: authUser.email.split('@')[0],
            role,
          },
        })
      }
    },
    get accessToken() {
      return get().user ? 'supabase-token' : ''
    },
    setAccessToken: () => {},
    resetAccessToken: () => {},
    reset: () => {
      supabase.auth.signOut().catch(() => {})
      set({ user: null })
    },
  },
}))
