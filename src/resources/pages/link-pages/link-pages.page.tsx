import { Copy, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { DevicePreview } from '@/resources/components/base/device-preview/device-preview.component';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';
import { routes } from '@/shared/constants/router.constants';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { cn } from '@/shared/lib/utils';
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
  nested,
  onSelect,
}: {
  page: LinkPageSummary;
  selected: boolean;
  nested?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      aria-current={selected || undefined}
      className={cn(
        'hover:bg-sidebar-accent flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-sm transition-colors',
        nested && 'pl-8',
        selected && 'bg-sidebar-accent font-medium shadow-xs',
      )}
    >
      {!nested && <Badge name={page.name} />}
      <span className='min-w-0 flex-1 truncate'>{page.name}</span>
      {page.status === 'INACTIVE' && (
        <span className='text-muted-foreground text-xs'>inativa</span>
      )}
    </button>
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

  function remove(page: LinkPageSummary) {
    const message =
      page.type === 'CLIENT'
        ? `Excluir "${page.name}" e todos os posts dele?`
        : `Excluir "${page.name}"?`;

    if (window.confirm(message)) {
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
            <PageListItem
              page={agencyPage}
              selected={selectedId === agencyPage.id}
              onSelect={() => select(agencyPage)}
            />
            {postsOf(agencyPage.id).map((post) => (
              <PageListItem
                key={post.id}
                page={post}
                nested
                selected={selectedId === post.id}
                onSelect={() => select(post)}
              />
            ))}
            {isMobile && (
              <NewPostForm
                bio={agencyPage}
                onCreate={createPost(agencyPage)}
              />
            )}
          </ListGroup>
        )}

        <ListGroup title='Clientes'>
          {clients.length === 0 && !isLoading && (
            <p className='text-muted-foreground px-2 py-1 text-sm'>
              Nenhum cliente ainda.
            </p>
          )}
          {clients.map((client) => (
            <div
              key={client.id}
              className='grid gap-0.5'
            >
              <PageListItem
                page={client}
                selected={selectedId === client.id}
                onSelect={() => select(client)}
              />
              {postsOf(client.id).map((post) => (
                <PageListItem
                  key={post.id}
                  page={post}
                  nested
                  selected={selectedId === post.id}
                  onSelect={() => select(post)}
                />
              ))}
              {isMobile && (
                <NewPostForm
                  bio={client}
                  onCreate={createPost(client)}
                />
              )}
            </div>
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
          <Badge name={page.name} />
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

      {detail.data ? (
        <DevicePreview>
          <LinkPageRenderer
            linkPage={detail.data}
            preview
          />
        </DevicePreview>
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
        {slug && (
          <p className='text-muted-foreground truncate text-xs'>
            /p/{bio.publicPath}/{slug}
          </p>
        )}
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
      <div className='flex gap-2'>
        <Button
          type='submit'
          size='sm'
          disabled={!slug}
        >
          Criar
        </Button>
        <Button
          type='button'
          size='sm'
          variant='ghost'
          onClick={() => setOpen(false)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
