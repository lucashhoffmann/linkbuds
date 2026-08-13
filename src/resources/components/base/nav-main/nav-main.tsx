import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/resources/components/ui/sidebar';

export interface INavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
}

interface INavMainProps {
  label?: string;
  items: INavMainItem[];
}

export function NavMain({ label = 'Plataforma', items }: INavMainProps) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            location.pathname === item.url ||
            location.pathname.startsWith(`${item.url}/`);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
              >
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
