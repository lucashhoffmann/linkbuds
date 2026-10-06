import { confirmAction } from '@/resources/components/base';
import {
  ChevronRight,
  Copy,
  ExternalLink,
  Link2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { toast } from 'sonner';
import type { LinkPageSummary } from '@/app/modules/link-pages/types/link-pages.types';
import {
  useGetLinkPageUseCase,
  useLinkPageMutations,
  useListLinkPagesUseCase,
} from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import {
  DevicePreview,
  SegmentedControl,
} from '@/resources/components/base/device-preview/device-preview.component';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';
import { routes } from '@/shared/constants/router.constants';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { cn } from '@/shared/lib/utils';
import { AnalyticsTab } from './components/editor/analytics-tab.component';
import { LinkPageRenderer } from './renderer/link-page-renderer.component';

const BADGE_COLORS = [
  'bg-[#efd9f5] text-[#6b2b80]',
  'bg-[#dcdcf7] text-[#34348a]',
  'bg-[#f5e3c8] text-[#7a4d0f]',
  'bg-[#d8ecd9] text-[#24592b]',
  'bg-[#d5e9ea] text-[#1f5458]',
];

function Badge({ name }: { name: string }) {
  const index =
    [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    BADGE_COLORS.length;

  return (
    <span
      aria-hidden='true'
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold',
        BADGE_COLORS[index],
      )}
    >
      {name.trim()[0]?.toUpperCase() ?? '?'}
    </span>
  );
}

/** Posts get a link icon so they read apart from bios at a glance. */
function PageIcon({ page }: { page: LinkPageSummary }) {
  if (page.type !== 'POST') return <Badge name={page.name} />;

  return (
    <span
      aria-hidden='true'
      className='bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md'
    >
      <Link2 className='size-3.5' />
    </span>
  );
}

function publicUrl(page: LinkPageSummary) {
  return `${window.location.origin}${routes.publicLinkPage(page.publicPath)}`;
}

function ListGroup({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className='grid gap-0.5'>
      <div className='text-muted-foreground flex items-center justify-between px-2 py-1 text-xs font-medium'>
        {title}
        {action}
      </div>
      {children}
    </section>
  );
}

function PageListItem({
  page,
  selected,
  expanded,
  onToggle,
  onSelect,
  onRemove,
}: {
  page: LinkPageSummary;
  selected: boolean;
  /** Bios only; undefined = no children to toggle. */
  expanded?: boolean;
  onToggle?: () => void;
  onSelect: () => void;
  onRemove?: () => void;
}) {
  const action =
    'text-muted-foreground hover:text-foreground hover:bg-background flex size-7 shrink-0 items-center justify-center rounded-md';

  return (
    <div
      className={cn(
        'group hover:bg-sidebar-accent flex min-h-10 w-full items-center gap-1 rounded-lg px-1 text-sm transition-colors',
        selected && 'bg-sidebar-accent font-medium shadow-xs',
      )}
    >
      {page.type !== 'POST' &&
        (expanded === undefined ? (
          <span className='size-6 shrink-0' />
        ) : (
          <button
            type='button'
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Ocultar' : 'Mostrar'} posts de ${page.name}`}
            className='text-muted-foreground hover:text-foreground flex size-6 shrink-0 items-center justify-center rounded-md'
          >
            <ChevronRight
              className={cn(
                'size-4 transition-transform',
                expanded && 'rotate-90',
              )}
            />
          </button>
        ))}
      <button
        type='button'
        onClick={onSelect}
        aria-current={selected || undefined}
        className='flex min-h-10 min-w-0 flex-1 items-center gap-2 pl-1 text-left'
      >
        <PageIcon page={page} />
        <span className='min-w-0 flex-1 truncate'>{page.name}</span>
        {page.status === 'INACTIVE' && (
          <span className='text-muted-foreground text-xs'>inativa</span>
        )}
      </button>
      {/* Desktop: reveal on hover/focus; touch has no hover, so always shown. */}
      <div className='flex items-center md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100'>
        <a
          href={publicUrl(page)}
          target='_blank'
          rel='noreferrer'
          title='Abrir link'
          aria-label={`Abrir link de ${page.name}`}
          className={action}
        >
          <ExternalLink className='size-4' />
        </a>
        <RouterLink
          to={routes.linkPages.edit(page.id)}
          title='Editar'
          aria-label={`Editar ${page.name}`}
          className={action}
        >
          <Pencil className='size-4' />
        </RouterLink>
        {onRemove && (
          <button
            type='button'
            onClick={onRemove}
            title='Excluir'
            aria-label={`Excluir ${page.name}`}
            className={cn(action, 'hover:text-destructive')}
          >
            <Trash2 className='size-4' />
          </button>
        )}
      </div>
    </div>
  );
}

// Tree connector: vertical rail + elbow at row mid-height (min-h-10 → top-5);
// the last branch cuts the rail at the elbow.
const TREE_BRANCH =
  'relative pl-4 before:absolute before:top-0 before:left-0 before:h-full before:border-l before:border-border after:absolute after:top-5 after:left-0 after:w-3 after:border-t after:border-border last:before:h-5';

/** A bio and its post sub-pages, collapsible. */
function BioTree({
  bio,
  posts,
  selectedId,
  onSelect,
  onRemove,
  children,
}: {
  bio: LinkPageSummary;
  posts: LinkPageSummary[];
  selectedId?: string;
  onSelect: (page: LinkPageSummary) => void;
  onRemove: (page: LinkPageSummary) => void;
  /** Extra branch after the posts (mobile "new post" form). */
  children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = posts.length > 0 || Boolean(children);

  return (
    <div className='grid gap-0.5'>
      <PageListItem
        page={bio}
        selected={selectedId === bio.id}
        expanded={hasChildren ? expanded : undefined}
        onToggle={() => setExpanded((value) => !value)}
        onSelect={() => onSelect(bio)}
        onRemove={bio.type === 'AGENCY' ? undefined : () => onRemove(bio)}
      />
      {hasChildren && expanded && (
        <ul className='ml-4 grid gap-0.5'>
          {posts.map((post) => (
            <li
              key={post.id}
              className={TREE_BRANCH}
            >
              <PageListItem
                page={post}
                selected={selectedId === post.id}
                onSelect={() => onSelect(post)}
                onRemove={() => onRemove(post)}
              />
            </li>
          ))}
          {children && <li className={TREE_BRANCH}>{children}</li>}
        </ul>
      )}
    </div>
  );
}

export function LinkPagesPage() {
  const { data, isLoading } = useListLinkPagesUseCase();
  const mutations = useLinkPageMutations();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const items = data?.items ?? [];
  const agencyPage = items.find((page) => page.type === 'AGENCY');
  // "Collection" = client: each client bio groups its post sub-pages.
  const clients = items.filter((page) => page.type === 'CLIENT');
  const postsOf = (bioId: string) =>
    items.filter((page) => page.parentPageId === bioId);
  const selected =
    items.find((page) => page.id === searchParams.get('p')) ?? agencyPage;
  // Mobile has no canvas, so nothing is "selected" there.
  const selectedId = isMobile ? undefined : selected?.id;
  const createPost =
    (bio: LinkPageSummary) =>
    (payload: { name: string; slug: string; postUrl: string | null }) =>
      mutations.createPost.mutate(
        { parentId: bio.id, ...payload },
        { onSuccess: (post) => navigate(routes.linkPages.edit(post.id)) },
      );
  const usage = data?.usage;

  function select(page: LinkPageSummary) {
    // Mobile has no canvas: go straight to the editor (it has the preview).
    if (isMobile) {
      navigate(routes.linkPages.edit(page.id));
      return;
    }

    setSearchParams({ p: page.id }, { replace: true });
  }

  async function remove(page: LinkPageSummary) {
    const confirmed = await confirmAction({
      title: `Excluir "${page.name}"?`,
      description:
        page.type === 'CLIENT'
          ? 'Todos os posts deste cliente também serão excluídos. Essa ação não pode ser desfeita.'
          : 'Essa ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      destructive: true,
    });

    if (confirmed) {
      mutations.remove.mutate(page.id, {
        onSuccess: () => setSearchParams({}, { replace: true }),
      });
    }
  }

  return (
    <div className='flex min-h-0 flex-1'>
      <aside className='bg-sidebar flex w-full shrink-0 flex-col gap-4 overflow-y-auto p-3 md:w-64 md:border-r lg:w-80'>
        <div className='flex items-center justify-between px-2 pt-1'>
          <div>
            <h1 className='text-base font-semibold'>Páginas</h1>
            {usage && (
              <p className='text-muted-foreground text-xs'>
                {usage.usedClientPages} de {usage.maxClientPages} clientes
              </p>
            )}
          </div>
          {usage && usage.remainingClientPages > 0 ? (
            <Button
              asChild
              size='sm'
            >
              <RouterLink to={routes.linkPages.new}>
                <Plus className='size-4' />
                Cliente
              </RouterLink>
            </Button>
          ) : (
            <Button
              size='sm'
              disabled
              title='Limite de clientes do plano atingido'
            >
              <Plus className='size-4' />
              Cliente
            </Button>
          )}
        </div>

        {isLoading && (
          <p className='text-muted-foreground px-2 text-sm'>Carregando...</p>
        )}

        {agencyPage && (
          <ListGroup title='Sua agência'>
            <BioTree
              bio={agencyPage}
              posts={postsOf(agencyPage.id)}
              selectedId={selectedId}
              onSelect={select}
              onRemove={(page) => void remove(page)}
            >
              {isMobile && (
                <NewPostForm
                  bio={agencyPage}
                  onCreate={createPost(agencyPage)}
                />
              )}
            </BioTree>
          </ListGroup>
        )}

        <ListGroup title='Clientes'>
          {clients.length === 0 && !isLoading && (
            <p className='text-muted-foreground px-2 py-1 text-sm'>
              Nenhum cliente ainda.
            </p>
          )}
          {clients.map((client) => (
            <BioTree
              key={client.id}
              bio={client}
              posts={postsOf(client.id)}
              selectedId={selectedId}
              onSelect={select}
              onRemove={(page) => void remove(page)}
            >
              {isMobile && (
                <NewPostForm
                  bio={client}
                  onCreate={createPost(client)}
                />
              )}
            </BioTree>
          ))}
        </ListGroup>
      </aside>

      <section className='hidden min-w-0 flex-1 flex-col overflow-y-auto md:flex'>
        {selected ? (
          <PageCanvas
            page={selected}
            onRemove={
              selected.type === 'AGENCY' ? undefined : () => remove(selected)
            }
            onCreatePost={
              selected.type === 'POST' ? undefined : createPost(selected)
            }
          />
        ) : (
          <p className='text-muted-foreground m-auto text-sm'>
            Selecione uma página.
          </p>
        )}
      </section>
    </div>
  );
}

function PageCanvas({
  page,
  onRemove,
  onCreatePost,
}: {
  page: LinkPageSummary;
  onRemove?: () => void;
  onCreatePost?: (payload: {
    name: string;
    slug: string;
    postUrl: string | null;
  }) => void;
}) {
  const detail = useGetLinkPageUseCase(page.id);
  const url = publicUrl(page);
  const [view, setView] = useState<'preview' | 'analytics'>('preview');

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado');
    } catch {
      toast.error('Não foi possível copiar.');
    }
  }

  return (
    <div className='flex flex-col gap-4 p-4 lg:p-6'>
      {/* Name on its own row below `lg`, where the canvas is narrow. */}
      <header className='flex flex-col gap-3 lg:flex-row lg:items-center'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <PageIcon page={page} />
          <div className='min-w-0 flex-1'>
            <h2 className='truncate font-semibold'>{page.name}</h2>
            <p className='text-muted-foreground truncate text-xs'>
              /p/{page.publicPath}
            </p>
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => void copy()}
          >
            <Copy className='size-4' />
            Copiar link
          </Button>
          <Button
            asChild
            variant='outline'
            size='sm'
          >
            <a
              href={url}
              target='_blank'
              rel='noreferrer'
            >
              <ExternalLink className='size-4' />
              Abrir
            </a>
          </Button>
          {onRemove && (
            <Button
              variant='outline'
              size='sm'
              aria-label={`Excluir ${page.name}`}
              onClick={onRemove}
            >
              <Trash2 className='size-4' />
            </Button>
          )}
          <Button
            asChild
            size='sm'
          >
            <RouterLink to={routes.linkPages.edit(page.id)}>
              <Pencil className='size-4' />
              Editar
            </RouterLink>
          </Button>
        </div>
      </header>

      {onCreatePost && (
        <NewPostForm
          bio={page}
          onCreate={onCreatePost}
        />
      )}

      <SegmentedControl
        label='Exibir'
        value={view}
        onChange={setView}
        options={[
          { value: 'preview', label: 'Prévia' },
          { value: 'analytics', label: 'Análises' },
        ]}
      />

      {detail.data ? (
        view === 'analytics' ? (
          <AnalyticsTab linkPage={detail.data} />
        ) : (
          <DevicePreview>
            <LinkPageRenderer
              linkPage={detail.data}
              preview
            />
          </DevicePreview>
        )
      ) : (
        <p className='text-muted-foreground text-sm'>Carregando prévia...</p>
      )}
    </div>
  );
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Post sub-page: /p/:bio/:post — a destination for one social post. */
function NewPostForm({
  bio,
  onCreate,
}: {
  bio: LinkPageSummary;
  onCreate: (payload: {
    name: string;
    slug: string;
    postUrl: string | null;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const slug = slugify(name);

  if (!open) {
    return (
      <Button
        type='button'
        variant='ghost'
        size='sm'
        className='justify-start'
        onClick={() => setOpen(true)}
      >
        <Plus className='size-4' />
        Novo link de post
      </Button>
    );
  }

  return (
    <form
      className='grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end'
      onSubmit={(event) => {
        event.preventDefault();
        onCreate({ name, slug, postUrl: postUrl || null });
      }}
    >
      <div className='grid gap-1'>
        <Label htmlFor={`post-name-${bio.id}`}>Nome do post</Label>
        <Input
          id={`post-name-${bio.id}`}
          required
          placeholder='Promo de terça'
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className='grid gap-1'>
        <Label htmlFor={`post-url-${bio.id}`}>Link do post (opcional)</Label>
        <Input
          id={`post-url-${bio.id}`}
          type='url'
          placeholder='https://instagram.com/p/...'
          value={postUrl}
          onChange={(event) => setPostUrl(event.target.value)}
        />
      </div>
      <div className='flex gap-2 [&>button]:h-12'>
        <Button
          type='submit'
          disabled={!slug}
        >
          Criar
        </Button>
        <Button
          type='button'
          variant='ghost'
          onClick={() => setOpen(false)}
        >
          Cancelar
        </Button>
      </div>
      {slug && (
        <p className='text-muted-foreground truncate text-xs sm:col-span-3'>
          /p/{bio.publicPath}/{slug}
        </p>
      )}
    </form>
  );
}
