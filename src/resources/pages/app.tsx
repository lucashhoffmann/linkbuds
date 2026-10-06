import { ThemeProvider } from '@/app/providers/theme-provider';
import { Router } from '@/app/router/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import {
  AppErrorBoundary,
  ConfirmDialog,
  IconTooltip,
} from '@/resources/components/base';

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 2,
      },
    },
  });

  return (
    <ThemeProvider
      defaultTheme='system'
      storageKey='linkbuds-theme'
      defaultColorTheme='default'
      colorStorageKey='linkbuds-color-theme'
    >
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools
          initialIsOpen={false}
          position='bottom'
        />

        <AppErrorBoundary>
          <Router />
        </AppErrorBoundary>

        <ConfirmDialog />
        <IconTooltip />

        <Toaster
          richColors
          position='top-right'
          toastOptions={{
            closeButton: true,
            classNames: {
              toast: 'flex flex-row items-start',
              closeButton: 'order-2 ml-auto',
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
