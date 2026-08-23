import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn, Shield, BarChart2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
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

  async function handleLoginSuccess(user: any) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'VIEWER'

    useAuthStore.getState().setUser({
      id: user.id,
      email: user.email!,
      name: profile?.name ?? user.user_metadata?.name ?? user.email!,
      role: role as any,
    })

    toast.success(`Welcome back (${role})!`)
    const targetPath = redirectTo || '/'
    navigate({ to: targetPath, replace: true })
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // 1. Try normal password sign in
      let { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      // 2. Smart fallback: If account does not exist, auto-register
      if (error && (error.message.includes('Invalid login credentials') || error.status === 400)) {
        toast.info('Account not found — creating new account for you...')
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { name: data.email.split('@')[0] },
          },
        })

        if (signUpErr) {
          toast.error(signUpErr.message)
          setIsLoading(false)
          return
        }

        if (signUpData.user) {
          const { data: retryAuth, error: retryErr } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          })

          if (retryErr) {
            toast.error(retryErr.message || 'Please check email for confirmation.')
            setIsLoading(false)
            return
          }
          authData = retryAuth
          error = null
        }
      }

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.error(
            'Supabase Email Confirmation Required: Run UPDATE auth.users SET email_confirmed_at = NOW(); in Supabase SQL Editor to enable 1-click login.'
          )
        } else {
          toast.error(error.message || 'Invalid email or password')
        }
        setIsLoading(false)
        return
      }

      if (authData?.user && authData?.session) {
        await handleLoginSuccess(authData.user)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  function handleDemoLogin(email: string) {
    form.setValue('email', email)
    form.setValue('password', 'password123')
    form.handleSubmit(onSubmit)()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
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
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Quick Demo Accounts
            </span>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-1.5'>
          <Button
            variant='outline'
            type='button'
            size='sm'
            className='text-xs flex items-center gap-1'
            disabled={isLoading}
            onClick={() => handleDemoLogin('admin.test@airfarex.com')}
          >
            <Shield className='size-3 text-emerald-500' /> Admin
          </Button>
          <Button
            variant='outline'
            type='button'
            size='sm'
            className='text-xs flex items-center gap-1'
            disabled={isLoading}
            onClick={() => handleDemoLogin('analyst.test@airfarex.com')}
          >
            <BarChart2 className='size-3 text-sky-500' /> Analyst
          </Button>
          <Button
            variant='outline'
            type='button'
            size='sm'
            className='text-xs flex items-center gap-1'
            disabled={isLoading}
            onClick={() => handleDemoLogin('viewer.test@airfarex.com')}
          >
            <Eye className='size-3 text-muted-foreground' /> Viewer
          </Button>
        </div>
      </form>
    </Form>
  )
}
