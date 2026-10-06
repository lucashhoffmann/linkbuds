import { ThemeModeToggle } from '@/resources/components/base/theme-mode-toggle/theme-mode-toggle.component';
import { Button } from '@/resources/components/ui/button';
import Footer4Col from '@/resources/components/ui/footer-column';
import {
  BarChart3,
  ClipboardList,
  Globe2,
  Link2,
  MousePointerClick,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { AuthHeroShowcase } from './components/auth-hero-showcase.component';
import { LoginView } from './views/login/login.view';
import { PricingPlansDialog } from './components/pricing-plans-dialog/pricing-plans-dialog.component';
import { RegisterView } from './views/register/register.view';
import { ForgotPasswordView } from './views/forgot-password/forgot-password.view';
import { ResetPasswordView } from './views/reset-password/reset-password.view';
import { routes } from '@/shared/constants/router.constants';

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
    icon: ClipboardList,
    label: 'Formulários',
    value: 'leads e quizzes',
  },
  {
    icon: MousePointerClick,
    label: 'Clientes',
    value: 'links em escala',
  },
];

const authHeadline = 'Todos os links dos seus clientes. Um painel.';
const authSubheadline =
  'Bio, links de post, formulários e questionários com domínio próprio, e métricas que mostram o que gera contato.';

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

      <div className='mx-auto flex w-full max-w-6xl flex-1 flex-col md:grid md:grid-cols-2'>
        <aside className='hidden flex-col justify-center gap-6 p-8 md:flex lg:p-12'>
          <span className='bg-card text-muted-foreground inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium'>
            <Link2 className='size-3.5' />
            Links de bio para agências
          </span>
          <div className='max-w-md space-y-2.5'>
            <h1 className='text-3xl leading-tight font-semibold tracking-tight xl:text-4xl'>
              {authHeadline}
            </h1>
            <p className='text-muted-foreground'>{authSubheadline}</p>
          </div>
          <div className='grid max-w-md grid-cols-2 gap-2'>
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
          <div className='flex max-w-md justify-center'>
            <AuthHeroShowcase />
          </div>
        </aside>

        <section className='animate-in fade-in mx-auto flex w-full max-w-[30.5rem] flex-col gap-3 px-5 pt-5 duration-500 sm:max-w-[30rem] sm:px-4 md:hidden'>
          <span className='bg-card text-muted-foreground inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium'>
            <Link2 className='size-3' />
            Links de bio para agências
          </span>
          <p className='text-xl leading-snug font-semibold tracking-tight'>
            {authHeadline}
          </p>
          <div
            aria-hidden
            className='-mx-5 flex h-36 justify-center overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent)]'
          >
            <AuthHeroShowcase />
          </div>
        </section>

        <main className='bg-card relative z-10 -mt-6 flex flex-1 justify-center rounded-t-3xl border-t px-5 pt-6 pb-8 shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.25)] sm:px-4 md:mt-0 md:items-center md:rounded-none md:border-t-0 md:bg-transparent md:py-12 md:shadow-none'>
          <div className='md:bg-card w-full max-w-md md:rounded-2xl md:border md:p-8 md:shadow-xs'>
            <View />
          </div>
        </main>
      </div>

      <Footer4Col />
    </div>
  );
}
