import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { IconClock, IconAlertCircle } from '@tabler/icons-react'

interface AirfarexHeaderProps {
  title?: string
  showDemoNotice?: boolean
}

export function AirfarexHeader({ title, showDemoNotice = true }: AirfarexHeaderProps) {
  return (
    <Header fixed className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex items-center gap-2 mr-auto'>
        {title && <span className='font-semibold text-base hidden sm:inline-block'>{title}</span>}
        <div className='hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/50'>
          <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
          <IconClock className='size-3.5' />
          <span>Last updated: 23 Aug 2026, 09:30 AM IST</span>
        </div>
        {showDemoNotice && (
          <Badge variant='outline' className='hidden lg:inline-flex text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1'>
            <IconAlertCircle className='size-3' />
            Demonstration Data
          </Badge>
        )}
      </div>

      <div className='flex items-center gap-2 ms-auto'>
        <Search />
        <ThemeSwitch />
        <ProfileDropdown />
      </div>
    </Header>
  )
}
