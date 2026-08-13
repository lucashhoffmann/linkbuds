import { Separator } from '@/resources/components/ui/separator';
import { SidebarTrigger } from '@/resources/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/resources/components/ui/breadcrumb';
import { ThemeModeToggle } from '../theme-mode-toggle/theme-mode-toggle.component';

interface IWorkspaceHeaderProps {
  title?: string;
}

export function WorkspaceHeader({ title = 'Dashboard' }: IWorkspaceHeaderProps) {
  return (
    <header className='bg-background sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b px-4'>
      <SidebarTrigger className='-ml-1' />
      <Separator
        orientation='vertical'
        className='mr-2 h-4'
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className='ml-auto flex items-center gap-2'>
        <ThemeModeToggle />
      </div>
    </header>
  );
}
