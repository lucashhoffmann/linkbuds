import * as React from 'react';
import { Home, PanelsTopLeft } from 'lucide-react';

import { NavMain } from '../nav-main';
import { NavUser } from '../nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/resources/components/ui/sidebar';
import { useSession } from '@/app/modules/auth/hooks';
import { routes } from '@/shared/constants/router.constants';

interface IAppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

const navItems = [
  {
    title: 'Início',
    url: routes.home,
    icon: Home,
  },
  {
    title: 'LinkPages',
    url: routes.linkPages.list,
    icon: PanelsTopLeft,
  },
];

export function AppSidebar({ ...props }: IAppSidebarProps) {
  const { company } = useSession();
  const companyName = company?.name ?? 'Linkbuds';
  const companyEmail = company?.email ?? 'Painel';

  return (
    <Sidebar
      collapsible='icon'
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg'>
              <div className='bg-primary text-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-md'>
                <span className='text-lg font-bold'>
                  {companyName.charAt(0)}
                </span>
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                <span className='truncate font-semibold'>{companyName}</span>
                <span className='text-muted-foreground truncate text-xs'>
                  {companyEmail}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
