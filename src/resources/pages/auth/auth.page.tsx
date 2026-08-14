import { ThemeModeToggle } from '@/resources/components/base/theme-mode-toggle/theme-mode-toggle.component';
import { Button } from '@/resources/components/ui/button';
import { BarChart3, Globe2, Link2, MousePointerClick } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { LoginView } from './views/login/login.view';
import { PricingPlansDialog } from './components/pricing-plans-dialog/pricing-plans-dialog.component';
import { RegisterView } from './views/register/register.view';
import { routes } from '@/shared/constants/router.constants';
import linksLandingImage from '@/shared/images/links-landing.png';

const authHighlights = [
  {
    icon: BarChart3,
    label: 'Métricas',
    value: 'acessos e cliques',
  },
  {
    icon: Globe2,
    label: 'Domínios',
    value: 'marca própria',
  },
  {
    icon: MousePointerClick,
    label: 'Clientes',
    value: 'links em escala',
  },
];

type AuthPageProps = {
  register?: boolean;
};

export function AuthPage({ register = false }: AuthPageProps) {
  return (
    <div className='h-dvh max-h-dvh w-full overflow-hidden bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100'>
      <header className='fixed top-3 left-1/2 z-30 flex h-12 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/95 px-3 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90'>
        <RouterLink
          to={routes.initial}
          className='flex items-center gap-2'
          aria-label='Ir para o início'
        >
          <span className='bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg'>
            <Link2 className='size-3.5' />
          </span>
          <span className='text-base font-semibold tracking-tight sm:text-lg'>
            Linkbuds
          </span>
        </RouterLink>

        <nav
          className='hidden items-center md:flex'
          aria-label='Navegação principal'
        >
          <PricingPlansDialog
            trigger={
              <button
                type='button'
                className='cursor-pointer rounded-md px-2 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white'
              >
                Planos
              </button>
            }
          />
        </nav>

        <div className='flex items-center gap-1.5 sm:gap-2'>
          <Button
            asChild
            variant='ghost'
            className='hidden h-8 px-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 sm:inline-flex dark:text-white dark:hover:bg-zinc-900'
          >
            <RouterLink to={routes.login}>Entrar</RouterLink>
          </Button>
          <PricingPlansDialog
            trigger={
              <Button className='h-8 rounded-lg px-3 text-xs font-semibold sm:hidden'>
                Planos
              </Button>
            }
          />
          <Button
            asChild
            className='hidden h-8 rounded-lg px-4 text-sm font-semibold sm:inline-flex'
          >
            <RouterLink to={routes.register}>Começar agora</RouterLink>
          </Button>
          <ThemeModeToggle />
        </div>
      </header>

      <div className='flex h-full min-h-0 w-full flex-col md:flex-row'>
        <aside className='relative hidden h-full min-h-0 w-full overflow-hidden border-zinc-300 bg-zinc-200/50 px-8 pt-20 pb-6 md:flex md:w-1/2 md:border-r lg:px-10 xl:px-12 dark:border-zinc-800 dark:bg-zinc-900/30'>
          <div className='pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(24,24,27,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.07)_1px,transparent_1px)] [background-size:56px_56px] opacity-70 dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] dark:opacity-25' />

          <div className='relative z-10 grid h-full min-h-0 w-full grid-rows-[auto_auto_minmax(0,1fr)_auto]'>
            <div className='max-w-xl space-y-3'>
              <span className='inline-flex w-fit items-center gap-2 rounded-full border border-zinc-300 bg-white/75 px-3 py-1 text-xs font-medium text-zinc-700 shadow-xs dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300'>
                <Link2 className='size-3.5' />
                Presença digital em um link
              </span>

              <div className='max-w-md space-y-2.5'>
                <h1 className='text-3xl leading-tight font-semibold xl:text-4xl'>
                  Tudo sobre você. Um link.
                </h1>
                <p className='text-base text-zinc-600 dark:text-zinc-400'>
                  Metrifique, controle, gerencie seus links e de seus clientes
                </p>
              </div>
            </div>

            <div className='mt-4 grid max-w-xl grid-cols-3 gap-2'>
              {authHighlights.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className='rounded-lg border border-zinc-300 bg-white/70 p-2.5 shadow-xs backdrop-blur xl:p-3 dark:border-zinc-800 dark:bg-zinc-950/45'
                >
                  <Icon className='mb-2 size-4 text-zinc-900 dark:text-zinc-100' />
                  <p className='text-sm leading-none font-semibold'>{label}</p>
                  <p className='mt-1 text-xs leading-snug text-zinc-500 dark:text-zinc-400'>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className='group/landing pointer-events-auto relative mt-4 flex min-h-0 items-center justify-center'>
              <div className='absolute inset-x-0 top-6 bottom-3 rounded-2xl border border-zinc-300 bg-white/45 shadow-inner dark:border-zinc-800 dark:bg-zinc-950/30' />
              <div className='absolute top-4 left-4 z-20 hidden rounded-lg border border-zinc-300 bg-white/90 px-3 py-2 text-xs shadow-sm xl:block dark:border-zinc-800 dark:bg-zinc-950/90'>
                <p className='font-semibold'>8 páginas ativas</p>
                <p className='text-zinc-500 dark:text-zinc-400'>
                  prontas para clientes
                </p>
              </div>
              <img
                src={linksLandingImage}
                alt='Preview de páginas de links do Linkbuds'
                className='relative z-10 h-auto max-h-full w-auto max-w-[calc(50vw-7rem)] object-contain drop-shadow-2xl transition duration-500 ease-out will-change-transform select-none group-hover/landing:-translate-y-3 group-hover/landing:scale-[1.025] group-hover/landing:-rotate-1 motion-reduce:transition-none dark:brightness-90 dark:contrast-110'
              />
              <div className='absolute right-4 bottom-6 z-20 hidden rounded-lg border border-zinc-300 bg-white/90 px-3 py-2 text-xs shadow-sm xl:block dark:border-zinc-800 dark:bg-zinc-950/90'>
                <p className='font-semibold'>Analytics centralizado</p>
                <p className='text-zinc-500 dark:text-zinc-400'>
                  visão por link e cliente
                </p>
              </div>
            </div>

            <p className='mt-3 text-sm text-zinc-500 dark:text-zinc-400'>
              Linkbuds estrutura sua operação, você gerencia.
            </p>
          </div>
        </aside>

        <main className='relative flex h-full min-h-0 w-full flex-1 bg-zinc-50 md:w-1/2 dark:bg-zinc-950'>
          <div className='flex h-full min-h-0 w-full items-center justify-center p-4 pt-20 md:p-8 md:pt-20 lg:p-10'>
            <div className='w-full max-w-115 border border-zinc-300 bg-white p-5 sm:p-6 xl:p-8 dark:border-zinc-800 dark:bg-zinc-900'>
              <div className='mb-6 flex items-center justify-center gap-3 md:hidden'>
                <div className='bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md text-lg font-semibold'>
                  <Link2 className='size-5' />
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
