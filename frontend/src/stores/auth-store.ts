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

const STORAGE_KEY = 'airfarex_auth_user'

function getInitialUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as User
    }
  } catch {
    // Ignore storage parse errors
  }
  return null
}

const initialUser = getInitialUser()

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  isLoading: !initialUser,
  setUser: (user) => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      } catch {}
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {}
    }
    set({ user, isLoading: false })
  },
  setLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    try {
      await supabase.auth.signOut()
    } catch {}
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
        get().setUser(null)
      } else {
        const role = (authUser.role?.[0] as Role) || 'VIEWER'
        get().setUser({
          id: authUser.accountNo || 'usr-demo-1',
          email: authUser.email,
          name: authUser.email.split('@')[0],
          role,
        })
      }
    },
    get accessToken() {
      const u = get().user
      if (!u) return ''
      return `demo-${u.role.toLowerCase()}-token`
    },
    setAccessToken: () => {},
    resetAccessToken: () => {},
    reset: () => {
      get().signOut()
    },
  },
}))
