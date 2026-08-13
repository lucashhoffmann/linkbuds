import { useSession } from '@/app/modules/auth/hooks';

export function HomePage() {
  const { company, userAuthenticated } = useSession();

  return (
    <div className='flex min-h-full flex-col gap-6'>
      <section className='border-border bg-card text-card-foreground rounded-md border p-6'>
        <div className='max-w-2xl space-y-2'>
          <p className='text-muted-foreground text-sm'>Bem-vindo</p>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {userAuthenticated?.name ?? 'Usuário'}
          </h1>
          <p className='text-muted-foreground text-sm'>
            Esta é a tela inicial do Linkbuds Web, já usando autenticação,
            sidebar, wrapper de layout e dark mode.
          </p>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        <div className='border-border rounded-md border p-4'>
          <p className='text-muted-foreground text-sm'>Empresa</p>
          <p className='mt-1 font-medium'>{company?.name ?? '-'}</p>
          <p className='text-muted-foreground text-sm'>
            {company?.email ?? '-'}
          </p>
        </div>
        <div className='border-border rounded-md border p-4'>
          <p className='text-muted-foreground text-sm'>Sessão</p>
          <p className='mt-1 font-medium'>Ativa</p>
          <p className='text-muted-foreground text-sm'>
            Dados carregados de `/auth/session`.
          </p>
        </div>
      </section>
    </div>
  );
}
