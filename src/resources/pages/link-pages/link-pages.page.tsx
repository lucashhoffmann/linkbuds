import { Globe2, Link2, Plus, Trash2 } from 'lucide-react';
import { type FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Action, AuthorizationSubject } from '@/app/modules/authorization/types/authorization.types';
import { useCan } from '@/app/modules/authorization/hooks/use-ability';
import {
  useCompanyDomainUseCase,
  useLinkPageMutations,
  useListLinkPagesUseCase,
} from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';
import { routes } from '@/shared/constants/router.constants';

export function LinkPagesPage() {
  const { data, isLoading } = useListLinkPagesUseCase();
  const mutations = useLinkPageMutations();
  const canManageDomain = useCan(
    Action.ManageCustomDomain,
    AuthorizationSubject.CompanyDomain,
  );
  const domain = useCompanyDomainUseCase(canManageDomain);

  return (
    <div className='flex min-h-full flex-col gap-4'>
      <header className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='text-muted-foreground text-sm'>LinkPages</p>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Páginas da agência e clientes
          </h1>
        </div>
        <Button asChild>
          <RouterLink to={routes.linkPages.new}>
            <Plus className='size-4' />
            Nova página cliente
          </RouterLink>
        </Button>
      </header>

      {data && (
        <section className='grid gap-3 md:grid-cols-3'>
          <div className='rounded-md border p-4'>
            <p className='text-muted-foreground text-sm'>Clientes</p>
            <p className='mt-1 text-xl font-semibold'>
              {data.usage.usedClientPages} / {data.usage.maxClientPages}
            </p>
          </div>
          <div className='rounded-md border p-4'>
            <p className='text-muted-foreground text-sm'>Restantes</p>
            <p className='mt-1 text-xl font-semibold'>
              {data.usage.remainingClientPages}
            </p>
          </div>
          <div className='rounded-md border p-4'>
            <p className='text-muted-foreground text-sm'>Página da agência</p>
            <p className='mt-1 text-xl font-semibold'>
              {data.items.some((page) => page.type === 'AGENCY') ? 'Criada' : 'Pendente'}
            </p>
          </div>
        </section>
      )}

      <section className='rounded-md border p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <h2 className='font-semibold'>Domínio customizado</h2>
            <p className='text-muted-foreground text-sm'>
              Configure um domínio da Company para publicar seus slugs.
            </p>
          </div>
          <Globe2 className='text-muted-foreground size-5' />
        </div>

        {canManageDomain ? (
          <DomainPanel domain={domain} />
        ) : (
          <p className='bg-muted/40 mt-3 rounded-md border p-3 text-sm'>
            Recurso disponível em planos com domínio customizado.
          </p>
        )}
      </section>

      <section className='grid gap-3'>
        {isLoading && <div className='rounded-md border p-4'>Carregando...</div>}
        {data?.items.map((page) => (
          <article
            key={page.id}
            className='flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between'
          >
            <div className='min-w-0'>
              <div className='flex items-center gap-2'>
                <Link2 className='size-4' />
                <h2 className='truncate font-semibold'>{page.name}</h2>
                <span className='bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs'>
                  {page.type}
                </span>
                <span className='bg-muted rounded-full px-2 py-0.5 text-xs'>
                  {page.status}
                </span>
              </div>
              <p className='text-muted-foreground mt-1 text-sm'>/{page.slug}</p>
            </div>
            <div className='flex gap-2'>
              <Button
                asChild
                variant='outline'
                size='sm'
              >
                <RouterLink to={routes.linkPages.edit(page.id)}>Editar</RouterLink>
              </Button>
              {page.type === 'CLIENT' && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => mutations.remove.mutate(page.id)}
                >
                  <Trash2 className='size-4' />
                </Button>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function DomainPanel({ domain }: { domain: ReturnType<typeof useCompanyDomainUseCase> }) {
  const currentDomain = domain.data;
  const createDomain = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const hostname = String(formData.get('hostname') ?? '');
    if (hostname) domain.create.mutate(hostname);
  };

  if (currentDomain) {
    return (
      <div className='mt-3 rounded-md border p-3 text-sm'>
        <p className='font-medium'>{currentDomain.hostname}</p>
        <p className='text-muted-foreground mt-1'>Status: {currentDomain.status}</p>
        <div className='bg-muted/40 mt-3 rounded-md p-3'>
          <p>DNS: {currentDomain.dnsInstructions.type}</p>
          <p>Nome: {currentDomain.dnsInstructions.name}</p>
          <p>Valor: {currentDomain.dnsInstructions.value}</p>
        </div>
        <div className='mt-3 flex gap-2'>
          <Button
            type='button'
            size='sm'
            variant='outline'
            onClick={() => domain.verify.mutate(currentDomain.id)}
          >
            Verificar
          </Button>
          <Button
            type='button'
            size='sm'
            variant='outline'
            onClick={() => domain.remove.mutate(currentDomain.id)}
          >
            Remover
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className='mt-3 flex flex-col gap-2 sm:flex-row sm:items-end'
      onSubmit={createDomain}
    >
      <div className='flex-1'>
        <Label htmlFor='hostname'>Domínio</Label>
        <Input
          id='hostname'
          name='hostname'
          placeholder='www.suaagencia.com'
        />
      </div>
      <Button type='submit'>Salvar domínio</Button>
    </form>
  );
}
