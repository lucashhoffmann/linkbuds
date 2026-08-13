import { ThemeModeToggle } from '@/resources/components/base/theme-mode-toggle/theme-mode-toggle.component';
import { LoginView } from './views/login/login.view';
import { RegisterView } from './views/register/register.view';

type AuthPageProps = {
  register?: boolean;
};

export function AuthPage({ register = false }: AuthPageProps) {
  return (
    <div className='min-h-svh w-full bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100'>
      <div className='flex min-h-svh w-full flex-col md:flex-row'>
        <aside className='hidden w-full border-zinc-300 bg-zinc-200/50 p-12 md:flex md:w-1/2 md:flex-col md:justify-between md:border-r dark:border-zinc-800 dark:bg-zinc-900/30'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md text-lg font-semibold'>
              L
            </div>
            <span className='text-xl font-semibold'>Linkbuds</span>
          </div>

          <div className='max-w-md space-y-4'>
            <h1 className='text-4xl leading-tight font-semibold'>
              Centralize sua operação em um painel limpo e direto.
            </h1>
            <p className='text-base text-zinc-600 dark:text-zinc-400'>
              Uma base inicial para autenticação, sessão e navegação do
              Linkbuds.
            </p>
          </div>

          <p className='text-sm text-zinc-500 dark:text-zinc-400'>
            Linkbuds estrutura sua operação, você gerencia.
          </p>
        </aside>

        <main className='relative flex w-full flex-1 bg-zinc-50 md:w-1/2 dark:bg-zinc-950'>
          <div className='absolute top-4 right-4 z-10 md:top-6 md:right-6'>
            <ThemeModeToggle />
          </div>

          <div className='flex min-h-svh w-full items-center justify-center p-5 md:p-10'>
            <div className='w-full max-w-115 border border-zinc-300 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900'>
              <div className='mb-6 flex items-center justify-center gap-3 md:hidden'>
                <div className='bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md text-lg font-semibold'>
                  L
                </div>
                <span className='text-xl font-semibold'>Linkbuds</span>
              </div>

              {!register ? <LoginView /> : <RegisterView />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
