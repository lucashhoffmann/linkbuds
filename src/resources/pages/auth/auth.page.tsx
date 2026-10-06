import { ThemeModeToggle } from '@/resources/components/base/theme-mode-toggle/theme-mode-toggle.component';
import { Button } from '@/resources/components/ui/button';
import { BarChart3, Globe2, Link2, MousePointerClick } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { LoginView } from './views/login/login.view';
import { PricingPlansDialog } from './components/pricing-plans-dialog/pricing-plans-dialog.component';
import { RegisterView } from './views/register/register.view';
import { ForgotPasswordView } from './views/forgot-password/forgot-password.view';
import { ResetPasswordView } from './views/reset-password/reset-password.view';
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

const AUTH_VIEWS = {
  login: LoginView,
  register: RegisterView,
  forgotPassword: ForgotPasswordView,
  resetPassword: ResetPasswordView,
};

type AuthPageProps = {
  view?: keyof typeof AUTH_VIEWS;
};

export function AuthPage({ view = 'login' }: AuthPageProps) {
  const register = view === 'register';
  const View = AUTH_VIEWS[view];

  return (
    <div className='bg-background text-foreground flex min-h-dvh flex-col'>
      <header className='bg-background/90 sticky top-0 z-30 border-b backdrop-blur'>
        <div className='mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-4'>
          <RouterLink
            to={routes.initial}
            className='flex items-center gap-2'
            aria-label='Ir para o início'
          >
            <span className='bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-xl text-xs font-bold'>
              LB
            </span>
            <span className='text-base font-semibold tracking-tight'>
              LinkBuds
            </span>
          </RouterLink>

          <div className='flex items-center gap-1.5 sm:gap-2'>
            <PricingPlansDialog
              trigger={
                <Button
                  variant='ghost'
                  size='sm'
                >
                  Planos
                </Button>
              }
            />
            <Button
              asChild
              variant='ghost'
              size='sm'
              className='hidden sm:inline-flex'
            >
              <RouterLink to={register ? routes.login : routes.register}>
                {register ? 'Entrar' : 'Criar conta'}
              </RouterLink>
            </Button>
            <ThemeModeToggle />
          </div>
        </div>
      </header>

      <div className='mx-auto grid w-full max-w-6xl flex-1 md:grid-cols-2'>
        <aside className='hidden flex-col justify-center gap-6 p-8 md:flex lg:p-12'>
          <span className='bg-card text-muted-foreground inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium'>
            <Link2 className='size-3.5' />
            Links de bio para agências
          </span>
          <div className='max-w-md space-y-2.5'>
            <h1 className='text-3xl leading-tight font-semibold tracking-tight xl:text-4xl'>
              Todos os links dos seus clientes. Um painel.
            </h1>
            <p className='text-muted-foreground'>
              Bio, links de post, domínio próprio e métricas que mostram qual
              publicação gera contato.
            </p>
          </div>
          <div className='grid max-w-md grid-cols-3 gap-2'>
            {authHighlights.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className='bg-card rounded-xl border p-3'
              >
                <Icon className='mb-2 size-4' />
                <p className='text-sm leading-none font-semibold'>{label}</p>
                <p className='text-muted-foreground mt-1 text-xs leading-snug'>
                  {value}
                </p>
              </div>
            ))}
          </div>
          <img
            src={linksLandingImage}
            alt='Prévia de páginas de links do LinkBuds'
            className='h-auto max-h-[42vh] w-auto max-w-full self-start object-contain drop-shadow-xl select-none dark:brightness-90'
          />
        </aside>

        <main className='flex justify-center px-4 py-8 md:items-center md:py-12'>
          <div className='bg-card w-full max-w-md rounded-2xl border p-5 shadow-xs sm:p-8'>
            <View />
          </div>
        </main>
      </div>
    </div>
  );
}
