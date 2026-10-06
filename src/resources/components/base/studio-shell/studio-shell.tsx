import {
  Home,
  LogOut,
  PanelsTopLeft,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useSession } from '@/app/modules/auth/hooks';
import { ThemeModeToggle } from '@/resources/components/base/theme-mode-toggle/theme-mode-toggle.component';
import { Avatar, AvatarFallback } from '@/resources/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/resources/components/ui/dropdown-menu';
import { routes } from '@/shared/constants/router.constants';
import { cn } from '@/shared/lib/utils';

/** `short` is used in the mobile tab bar, where 4 tabs share ~80px each. */
type NavItem = { label: string; short?: string; to: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { label: 'Início', to: routes.home, icon: Home },
  { label: 'Páginas', to: routes.linkPages.list, icon: PanelsTopLeft },
  { label: 'Equipe', to: routes.team, icon: Users },
  {
    label: 'Configurações',
    short: 'Ajustes',
    to: routes.settings,
    icon: Settings,
  },
];

function initials(name?: string) {
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

function UserMenu({ side }: { side: 'right' | 'top' }) {
  const { userAuthenticated, company, handleLogout } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className='focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-none'
        aria-label='Conta'
      >
        <Avatar className='size-9'>
          <AvatarFallback className='bg-primary text-primary-foreground text-xs font-semibold'>
            {initials(userAuthenticated?.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align='end'
        className='min-w-56'
      >
        <DropdownMenuLabel className='grid font-normal'>
          <span className='truncate font-medium'>
            {userAuthenticated?.name}
          </span>
          <span className='text-muted-foreground truncate text-xs'>
            {userAuthenticated?.email}
          </span>
          <span className='text-muted-foreground truncate text-xs'>
            {company?.name}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className='mr-2 size-4' />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BrandMark() {
  return (
    <div className='bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl text-sm font-bold'>
      LB
    </div>
  );
}

/**
 * App shell from the design system: icon rail on desktop, bottom tab bar on
 * mobile. Pages own their inner layout (list panel, canvas).
 */
export function StudioShell({ children }: { children: ReactNode }) {
  return (
    <div className='bg-background flex h-svh flex-col md:flex-row'>
      <nav
        aria-label='Principal'
        className='bg-sidebar hidden w-16 shrink-0 flex-col items-center gap-2 border-r py-3 md:flex'
      >
        <BrandMark />
        <div className='mt-4 flex flex-col gap-1'>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground flex size-10 items-center justify-center rounded-xl transition-colors',
                  isActive && 'bg-sidebar-accent text-foreground shadow-xs',
                )
              }
            >
              <item.icon className='size-[18px]' />
            </NavLink>
          ))}
        </div>
        <div className='mt-auto flex flex-col items-center gap-2'>
          <ThemeModeToggle />
          <UserMenu side='right' />
        </div>
      </nav>

      <header className='bg-sidebar flex items-center justify-between border-b px-4 py-2 md:hidden'>
        <BrandMark />
        <div className='flex items-center gap-2'>
          <ThemeModeToggle />
          <UserMenu side='top' />
        </div>
      </header>

      <main className='flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+64px)] md:pb-0'>
        {children}
      </main>

      <nav
        aria-label='Principal'
        className='bg-sidebar fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t pb-[env(safe-area-inset-bottom)] md:hidden'
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'text-muted-foreground flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                isActive && 'text-foreground',
              )
            }
          >
            <item.icon className='size-5' />
            <span className='max-w-full truncate px-1'>
              {item.short ?? item.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
