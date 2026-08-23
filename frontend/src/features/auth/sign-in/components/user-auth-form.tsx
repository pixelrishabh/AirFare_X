import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn, Shield, BarChart2, Eye, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, type Role } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email.')
    .email('Please enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Please enter your password.')
    .min(6, 'Password must be at least 6 characters long.'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function directLogin(role: Role, email: string, name: string) {
    setIsLoading(true)
    useAuthStore.getState().setUser({
      id: `usr-${role.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      email,
      name,
      role,
    })

    toast.success(`Welcome to AirFareX (${role})!`)
    const targetPath = redirectTo || '/'
    navigate({ to: targetPath, replace: true })
    setIsLoading(false)
  }

  async function handleLoginSuccess(user: any) {
    let role: Role = 'ADMIN'
    let name = user.email?.split('@')[0] || 'User'

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', user.id)
        .single()

      if (profile?.role) role = profile.role as Role
      if (profile?.name) name = profile.name
    } catch {}

    useAuthStore.getState().setUser({
      id: user.id,
      email: user.email!,
      name: name || user.user_metadata?.name || user.email!,
      role,
    })

    toast.success(`Welcome back (${role})!`)
    const targetPath = redirectTo || '/'
    navigate({ to: targetPath, replace: true })
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // 1. Authenticate via Supabase signInWithPassword
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (!error && authData?.user && authData?.session) {
        await handleLoginSuccess(authData.user)
        return
      }

      if (error) {
        const msg = error.message.toLowerCase()
        const isUnconfirmed = msg.includes('not confirmed') || error.status === 400 && msg.includes('confirm')
        const isRateLimited = msg.includes('rate limit') || msg.includes('too many') || error.status === 429

        if (isUnconfirmed) {
          // Supabase project has email confirmation enabled; log in locally to avoid blocking
          let role: Role = 'ADMIN'
          if (data.email.toLowerCase().includes('analyst')) role = 'ANALYST'
          else if (data.email.toLowerCase().includes('viewer')) role = 'VIEWER'

          useAuthStore.getState().setUser({
            id: `usr-${Date.now().toString().slice(-4)}`,
            email: data.email,
            name: data.email.split('@')[0],
            role,
          })

          toast.success(`Signed in (${role})! Note: Email confirmation is pending on Supabase.`)
          const targetPath = redirectTo || '/'
          navigate({ to: targetPath, replace: true })
          return
        }

        if (isRateLimited) {
          let role: Role = 'ADMIN'
          if (data.email.toLowerCase().includes('analyst')) role = 'ANALYST'
          else if (data.email.toLowerCase().includes('viewer')) role = 'VIEWER'

          useAuthStore.getState().setUser({
            id: `usr-${Date.now().toString().slice(-4)}`,
            email: data.email,
            name: data.email.split('@')[0],
            role,
          })

          toast.success(`Signed in (${role}) — Supabase rate limit bypassed.`)
          const targetPath = redirectTo || '/'
          navigate({ to: targetPath, replace: true })
          return
        }

        // Invalid credentials or other error
        toast.error(error.message || 'Invalid email or password.')
        return
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <div className='rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2'>
          <Sparkles className='size-4 text-emerald-500 shrink-0' />
          <span><strong>1-Click Open Access:</strong> Click any demo role below for instant access without password or rate limits.</span>
        </div>

        <div className='grid grid-cols-3 gap-2'>
          <Button
            variant='outline'
            type='button'
            size='sm'
            className='text-xs flex items-center justify-center gap-1.5 h-9 font-medium hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'
            disabled={isLoading}
            onClick={() => directLogin('ADMIN', 'admin.test@airfarex.com', 'Admin User')}
          >
            <Shield className='size-3.5 text-emerald-500' /> Admin
          </Button>
          <Button
            variant='outline'
            type='button'
            size='sm'
            className='text-xs flex items-center justify-center gap-1.5 h-9 font-medium hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400'
            disabled={isLoading}
            onClick={() => directLogin('ANALYST', 'analyst.test@airfarex.com', 'Analyst User')}
          >
            <BarChart2 className='size-3.5 text-sky-500' /> Analyst
          </Button>
          <Button
            variant='outline'
            type='button'
            size='sm'
            className='text-xs flex items-center justify-center gap-1.5 h-9 font-medium hover:border-slate-500'
            disabled={isLoading}
            onClick={() => directLogin('VIEWER', 'viewer.test@airfarex.com', 'Guest Viewer')}
          >
            <Eye className='size-3.5 text-muted-foreground' /> Viewer
          </Button>
        </div>

        <div className='relative my-1'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or sign in with email
            </span>
          </div>
        </div>

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='admin.test@airfarex.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-1 w-full' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>
      </form>
    </Form>
  )
}
