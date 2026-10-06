import { ArrowRight, Eye, MousePointerClick, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSession } from '@/app/modules/auth/hooks';
import type { LinkPagesOverviewPage } from '@/app/modules/link-pages/types/link-pages.types';
import { useLinkPagesOverviewUseCase } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import { Button } from '@/resources/components/ui/button';
import { routes } from '@/shared/constants/router.constants';

const number = new Intl.NumberFormat('pt-BR');

function count(value: number, singular: string, plural: string) {
  return `${number.format(value)} ${value === 1 ? singular : plural}`;
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className='bg-card rounded-2xl border p-4'>
      <div className='text-muted-foreground flex items-center gap-2 text-sm'>
        {icon}
        {label}
      </div>
      <p className='mt-2 text-2xl font-semibold tracking-tight'>
        {number.format(value)}
      </p>
    </div>
  );
}

function PageRanking({
  title,
  empty,
  pages,
  metric,
}: {
  title: string;
  empty: string;
  pages: LinkPagesOverviewPage[];
  metric: 'pageViews' | 'clicks';
}) {
  return (
    <section className='bg-card rounded-2xl border'>
      <h2 className='border-b p-4 text-sm font-medium'>{title}</h2>
      {pages.length === 0 ? (
        <p className='text-muted-foreground p-4 text-sm'>{empty}</p>
      ) : (
        <ol className='divide-y'>
          {pages.map((page) => (
            <li key={page.id}>
              <RouterLink
                to={`${routes.linkPages.list}?p=${page.id}`}
                className='hover:bg-muted/60 flex items-center gap-3 p-4 text-sm'
              >
                <div className='min-w-0 flex-1'>
                  <p className='truncate font-medium'>{page.name}</p>
                  <p className='text-muted-foreground truncate text-xs'>
                    /p/{page.publicPath}
                  </p>
                </div>
                <span className='text-muted-foreground hidden text-xs sm:inline'>
                  {count(page.pageViews, 'view', 'views')} ·{' '}
                  {count(page.clicks, 'clique', 'cliques')}
                </span>
                <span className='w-14 text-right font-semibold'>
                  {number.format(page[metric])}
                </span>
              </RouterLink>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** Agency overview: how the clients' pages and post links are performing. */
export function HomePage() {
  const { company, userAuthenticated } = useSession();
  const { data, isLoading } = useLinkPagesOverviewUseCase();
  const firstName = userAuthenticated?.name.split(' ')[0];
  const posts = (data?.pages ?? [])
    .filter((page) => page.type === 'POST' && page.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);
  const pages = (data?.pages ?? [])
    .filter((page) => page.type !== 'POST' && page.pageViews > 0)
    .slice(0, 5);

  return (
    <div className='mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 md:p-8'>
      <header className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold tracking-tight'>
            Olá{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {company?.name} ·{' '}
            {data?.tier === 'FULL' ? 'últimos 30 dias' : 'últimos 7 dias'}
          </p>
        </div>
        <Button
          asChild
          variant='outline'
          size='sm'
        >
          <RouterLink to={routes.linkPages.list}>
            Gerenciar páginas
            <ArrowRight className='size-4' />
          </RouterLink>
        </Button>
      </header>

      {isLoading && (
        <p className='text-muted-foreground text-sm'>Carregando...</p>
      )}

      {data && (
        <>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
            <Stat
              icon={<Eye className='size-4' />}
              label='Visualizações'
              value={data.totals.pageViews}
            />
            <Stat
              icon={<Users className='size-4' />}
              label='Visitantes'
              value={data.totals.visitors}
            />
            <Stat
              icon={<MousePointerClick className='size-4' />}
              label='Cliques'
              value={data.totals.clicks}
            />
          </div>

          <div className='grid gap-4 lg:grid-cols-2 [&>*]:min-w-0'>
            <PageRanking
              title='Páginas mais acessadas'
              empty='Ainda sem visitas no período. Compartilhe os links dos clientes.'
              pages={pages}
              metric='pageViews'
            />
            <PageRanking
              title='Posts que mais geram cliques'
              empty='Crie links de post para medir qual publicação gera contato.'
              pages={posts}
              metric='clicks'
            />
          </div>
        </>
      )}
    </div>
  );
}
