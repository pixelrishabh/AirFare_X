import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { handleServerError } from '@/lib/handle-server-error'
import { DirectionProvider } from './context/direction-provider'
import { FontProvider } from './context/font-provider'
import { ThemeProvider } from './context/theme-provider'
// Generated Routes
import { routeTree } from './routeTree.gen'
// Styles
import './styles/index.css'

import type { Session } from '@supabase/supabase-js'

async function syncUserFromSession(session: Session | null) {
  if (!session) {
    // If no Supabase session exists, check if we already have a persisted local/demo user
    const existing = useAuthStore.getState().user
    if (!existing) {
      useAuthStore.getState().setUser(null)
    }
    return
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', session.user.id)
      .single()

    const role = profile?.role ?? session.user.user_metadata?.role ?? 'VIEWER'

    useAuthStore.getState().setUser({
      id: session.user.id,
      email: session.user.email!,
      name: profile?.name ?? session.user.user_metadata?.name ?? session.user.email!,
      role: role as any,
    })
  } catch {
    const role = session.user.user_metadata?.role ?? 'VIEWER'
    useAuthStore.getState().setUser({
      id: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata?.name ?? session.user.email!,
      role: role as any,
    })
  }
}

export async function initAuth() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    await syncUserFromSession(session)
  } catch {
    // If Supabase network fails or is rate-limited, keep local persisted user session
  } finally {
    useAuthStore.getState().setLoading(false)
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      await syncUserFromSession(session)
    }
    useAuthStore.getState().setLoading(false)
  })
}

initAuth()



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Session expired!')
          useAuthStore.getState().auth.reset()
          const redirect = `${router.history.location.href}`
          router.navigate({ to: '/sign-in', search: { redirect } })
        }
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!')
          // Only navigate to error page in production to avoid disrupting HMR in development
          if (import.meta.env.PROD) {
            router.navigate({ to: '/500' })
          }
        }
        if (error.response?.status === 403) {
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
function AppRoot() {
  const isLoading = useAuthStore((s) => s.isLoading)
  if (isLoading) return null

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FontProvider>
          <DirectionProvider>
            <RouterProvider router={router} />
          </DirectionProvider>
        </FontProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <AppRoot />
    </StrictMode>
  )
}

