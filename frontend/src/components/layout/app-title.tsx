import { Link } from '@tanstack/react-router'
import { IconPlaneTilt, IconMenu2, IconX } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '../ui/button'

export function AppTitle() {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='gap-2.5 py-2 hover:bg-transparent active:bg-transparent'
          asChild
        >
          <div className='flex items-center justify-between w-full'>
            <Link
              to='/'
              onClick={() => setOpenMobile(false)}
              className='flex items-center gap-2.5 text-start leading-tight'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold'>
                <IconPlaneTilt className='size-5' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-bold tracking-tight text-base'>AirFareX</span>
                <span className='truncate text-[10px] text-muted-foreground font-medium uppercase tracking-wider'>
                  Price Intelligence
                </span>
              </div>
            </Link>
            <ToggleSidebar />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function ToggleSidebar({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar='trigger'
      data-slot='sidebar-trigger'
      variant='ghost'
      size='icon'
      className={cn('aspect-square size-8 max-md:scale-125 text-muted-foreground hover:text-foreground', className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <IconX className='md:hidden size-4' />
      <IconMenu2 className='max-md:hidden size-4' />
      <span className='sr-only'>Toggle Sidebar</span>
    </Button>
  )
}
