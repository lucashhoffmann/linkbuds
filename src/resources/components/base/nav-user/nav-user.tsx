import { ChevronsUpDown, LogOut } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/resources/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/resources/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/resources/components/ui/sidebar';
import { useSession } from '@/app/modules/auth/hooks';

function getUserInitials(name?: string) {
  return (
    name
      ?.split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  );
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { userAuthenticated, handleLogout } = useSession();

  if (!userAuthenticated) {
    return null;
  }

  const userInitials = getUserInitials(userAuthenticated.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarFallback className='rounded-lg'>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {userAuthenticated.name}
                </span>
                <span className='truncate text-xs'>
                  {userAuthenticated.email}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg'>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>
                    {userAuthenticated.name}
                  </span>
                  <span className='truncate text-xs'>
                    {userAuthenticated.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className='mr-2' />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
