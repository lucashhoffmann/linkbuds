import * as React from 'react';

import {
  SidebarInset,
  SidebarProvider,
} from '@/resources/components/ui/sidebar';
import { WorkspaceHeader } from '@/resources/components/base/workspace-header';
import { AppSidebar } from '@/resources/components/base/app-sidebar';

interface IAppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: IAppLayoutProps) {
  return (
    <div className='bg-background relative flex h-svh'>
      <SidebarProvider className='relative'>
        <AppSidebar />
        <SidebarInset className='flex h-full flex-col overflow-hidden'>
          <WorkspaceHeader title={title} />
          <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
            <div className='flex min-h-0 flex-1 flex-col p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]'>
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
