import { confirmAction } from '@/resources/components/base';
import {
  BarChart3,
  ChevronRight,
  ClipboardList,
  Copy,
  Eye,
  ExternalLink,
  Link2,
  Pencil,
  Plus,
  Power,
  QrCode,
  Trash2,
  Trophy,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { toast } from 'sonner';
import { usePreviewStore } from '@/app/store/preview-store/use-preview-store';
import type { LinkPageSummary } from '@/app/modules/link-pages/types/link-pages.types';
import {
  useGetLinkPageUseCase,
  useLinkPageMutations,
  useLinkPagesOverviewUseCase,
  useListLinkPagesUseCase,
  usePublicOrigin,
} from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import {
  DevicePreview,
  SegmentedControl,
} from '@/resources/components/base/device-preview/device-preview.component';
import { Button } from '@/resources/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/resources/components/ui/dialog';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';
import { Select } from '@/resources/components/ui/select';
import { Switch } from '@/resources/components/ui/switch';
import { routes } from '@/shared/constants/router.constants';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { cn } from '@/shared/lib/utils';
import {
  AnalyticsSummary,
  AnalyticsTab,
  QrCodeVisitsCard,
} from './components/editor/analytics-tab.component';
import { FormsTab, ResponsesTab } from './components/forms-tabs.component';
import { IntegrationsPanel } from './components/integrations-panel.component';
import { SubPagesPromoDialog } from './components/sub-pages-promo-dialog.component';
import { LinkPageRenderer } from './renderer/link-page-renderer.component';
import {
  socialPlatformIcons,
  socialPlatformLabels,
} from './renderer/social-platform-icons';

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

/** Posts and forms get an icon so they read apart from bios at a glance. */
function PageIcon({ page }: { page: LinkPageSummary }) {
  if (!page.parentPageId) return <Badge name={page.name} />;

  const Icon = page.type === 'FORM' ? ClipboardList : Link2;

  return (
    <span
      aria-hidden='true'
      className='bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md'
    >
      <Icon className='size-3.5' />
    </span>
  );
}

/** Green = live, yellow = deactivated (public link returns not found). */
function StatusBadge({ status }: { status: LinkPageSummary['status'] }) {
  const active = status === 'ACTIVE';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        active
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      )}
    >
      <span
        aria-hidden='true'
        className={cn(
          'size-1.5 rounded-full',
          active ? 'bg-emerald-500' : 'bg-amber-500',
        )}
      />
      {active ? 'Ativa' : 'Inativa'}
    </span>
  );
}

function publicUrl(origin: string, page: LinkPageSummary) {
  return `${origin}${routes.publicLinkPage(page.publicPath)}`;
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
    <section className='grid grid-cols-1 gap-0.5'>
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
  const publicOrigin = usePublicOrigin();
  const action =
    'text-muted-foreground hover:text-foreground hover:bg-background flex size-7 shrink-0 items-center justify-center rounded-md';

  return (
    <div
      className={cn(
        'group hover:bg-sidebar-accent flex min-h-10 w-full items-center gap-1 rounded-lg px-1 text-sm transition-colors',
        selected && 'bg-sidebar-accent font-medium shadow-xs',
      )}
    >
      {!page.parentPageId &&
        (expanded === undefined ? (
          <span className='size-6 shrink-0' />
        ) : (
          <button
            type='button'
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Ocultar' : 'Mostrar'} posts e formulários de ${page.name}`}
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
        {page.status === 'INACTIVE' && <StatusBadge status={page.status} />}
      </button>
      {/* Desktop: reveal on hover/focus; touch has no hover, so always shown. */}
      <div className='flex items-center md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100'>
        <a
          href={publicUrl(publicOrigin, page)}
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

/** A bio and its post/form sub-pages, collapsible. */
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
  /** Extra branch after the sub-pages (mobile "new post/form" buttons). */
  children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = posts.length > 0 || Boolean(children);

  return (
    <div className='grid grid-cols-1 gap-0.5'>
      <PageListItem
        page={bio}
        selected={selectedId === bio.id}
        expanded={hasChildren ? expanded : undefined}
        onToggle={() => setExpanded((value) => !value)}
        onSelect={() => onSelect(bio)}
        onRemove={bio.type === 'AGENCY' ? undefined : () => onRemove(bio)}
      />
      {hasChildren && expanded && (
        <ul className='ml-4 grid grid-cols-1 gap-0.5'>
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
  const initialView = searchParams.get('v') ?? undefined;
  // Mobile has no canvas, so nothing is "selected" there.
  const selectedId = isMobile ? undefined : selected?.id;
  const createPost =
    (bio: LinkPageSummary) =>
    (payload: { name: string; slug: string; postUrl: string | null }) =>
      mutations.createPost.mutate(
        { parentId: bio.id, ...payload },
        { onSuccess: (post) => navigate(routes.linkPages.edit(post.id)) },
      );
  const createForm =
    (bio: LinkPageSummary) =>
    ({ name, slug }: { name: string; slug: string }) =>
      mutations.createForm.mutate(
        { parentId: bio.id, name, slug },
        { onSuccess: (form) => navigate(routes.linkPages.edit(form.id)) },
      );
  const usage = data?.usage;

  /** `view` opens a canvas tab (e.g. a form's responses). */
  function select(page: LinkPageSummary, view?: string) {
    // Mobile has no canvas: go straight to the editor (it has the preview).
    if (isMobile) {
      navigate(routes.linkPages.edit(page.id));
      return;
    }

    setSearchParams(view ? { p: page.id, v: view } : { p: page.id }, {
      replace: true,
    });
  }

  const newSubPageButtons = (bio: LinkPageSummary) => (
    <div className='flex flex-wrap gap-1'>
      <NewPostForm
        bio={bio}
        onCreate={createPost(bio)}
      />
      <NewPostForm
        kind='FORM'
        bio={bio}
        onCreate={createForm(bio)}
      />
    </div>
  );

  async function remove(page: LinkPageSummary) {
    const confirmed = await confirmAction({
      title: `Excluir "${page.name}"?`,
      description:
        page.type === 'CLIENT'
          ? 'Todos os posts e formulários (com as respostas) deste cliente também serão excluídos. Essa ação não pode ser desfeita.'
          : page.type === 'FORM'
            ? 'As respostas deste formulário também serão excluídas. Essa ação não pode ser desfeita.'
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
      <SubPagesPromoDialog />
      <aside className='bg-sidebar flex w-full shrink-0 flex-col gap-4 overflow-y-auto p-3 md:w-64 md:border-r lg:w-80'>
        <div className='flex items-center justify-between px-2 pt-1'>
          <div>
            <h1 className='text-base font-semibold'>Páginas</h1>
            {usage && (
              <>
                <p className='text-muted-foreground text-xs'>
                  {usage.usedClientPages} de {usage.maxClientPages} clientes
                </p>
                <p className='text-muted-foreground text-xs'>
                  {usage.usedForms} de {usage.maxForms} formulários
                </p>
              </>
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
              {isMobile && newSubPageButtons(agencyPage)}
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
              {isMobile && newSubPageButtons(client)}
            </BioTree>
          ))}
        </ListGroup>
      </aside>

      <section className='hidden min-w-0 flex-1 flex-col overflow-y-auto md:flex'>
        {selected ? (
          <PageCanvas
            key={selected.id}
            page={selected}
            subPages={postsOf(selected.id)}
            initialView={initialView}
            onSelect={select}
            onRemoveSubPage={(subPage) => void remove(subPage)}
            onRemove={
              selected.type === 'AGENCY' ? undefined : () => remove(selected)
            }
            newSubPage={
              selected.parentPageId ? undefined : newSubPageButtons(selected)
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

type CanvasView =
  | 'preview'
  | 'analytics'
  | 'posts'
  | 'forms'
  | 'responses'
  | 'integrations'
  | 'share';

function PageCanvas({
  page,
  subPages,
  initialView,
  onSelect,
  onRemoveSubPage,
  onRemove,
  newSubPage,
}: {
  page: LinkPageSummary;
  /** Bio only: its posts and forms. */
  subPages: LinkPageSummary[];
  initialView?: string;
  onSelect: (page: LinkPageSummary, view?: string) => void;
  onRemoveSubPage: (subPage: LinkPageSummary) => void;
  onRemove?: () => void;
  /** Bio only: "new post" / "new form" buttons. */
  newSubPage?: React.ReactNode;
}) {
  const detail = useGetLinkPageUseCase(page.id);
  const url = publicUrl(usePublicOrigin(), page);
  const isBio = !page.parentPageId;
  const views: Array<{ value: CanvasView; label: string }> = [
    { value: 'preview', label: 'Prévia' },
    { value: 'analytics', label: 'Análises' },
    ...(isBio
      ? [
          { value: 'posts' as const, label: 'Meus posts' },
          { value: 'forms' as const, label: 'Formulários' },
        ]
      : []),
    ...(page.type === 'FORM'
      ? [{ value: 'responses' as const, label: 'Respostas' }]
      : []),
    { value: 'integrations', label: 'Integrações' },
    { value: 'share', label: 'Compartilhar' },
  ];
  const [view, setView] = useState<CanvasView>(
    views.find((option) => option.value === initialView)?.value ?? 'preview',
  );
  const { analyticsOpen, toggleAnalytics } = usePreviewStore();
  const { update } = useLinkPageMutations(page.id);
  const active = page.status === 'ACTIVE';

  async function toggleStatus() {
    const confirmed = await confirmAction({
      title: `${active ? 'Desativar' : 'Ativar'} "${page.name}"?`,
      description: active
        ? page.parentPageId
          ? 'A página sai do ar, mas nada é excluído. Você pode ativar de novo quando quiser.'
          : 'A página e seus posts e formulários saem do ar, mas nada é excluído. Você pode ativar de novo quando quiser.'
        : 'A página volta a ficar acessível pelo link público.',
      confirmLabel: active ? 'Desativar' : 'Ativar',
    });
    if (!confirmed) return;

    update.mutate(
      { status: active ? 'INACTIVE' : 'ACTIVE' },
      {
        onSuccess: () =>
          toast.success(active ? 'Página desativada' : 'Página ativada'),
      },
    );
  }

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
            <div className='flex min-w-0 items-center gap-2'>
              <h2 className='truncate font-semibold'>{page.name}</h2>
              <StatusBadge status={page.status} />
            </div>
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
            variant='outline'
            size='sm'
            disabled={update.isPending}
            title={
              active
                ? 'Tira a página do ar sem excluir'
                : 'Coloca a página no ar de novo'
            }
            onClick={() => void toggleStatus()}
          >
            <Power className='size-4' />
            {active ? 'Desativar' : 'Ativar'}
          </Button>
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

      {newSubPage}

      <SegmentedControl
        label='Exibir'
        value={view}
        onChange={setView}
        options={views}
      />

      {view === 'share' ? (
        <div className='flex flex-wrap items-start gap-6'>
          <ShareTab
            defaultUrl={url}
            name={page.publicPath}
          />
          {detail.data && (
            <div className='w-64'>
              <QrCodeVisitsCard linkPage={detail.data} />
            </div>
          )}
        </div>
      ) : view === 'posts' ? (
        <PostsTab
          posts={subPages.filter((subPage) => subPage.type === 'POST')}
          onView={(post) => onSelect(post)}
          onRemove={onRemoveSubPage}
        />
      ) : view === 'forms' ? (
        <FormsTab
          forms={subPages.filter((subPage) => subPage.type === 'FORM')}
          onView={(form) => onSelect(form)}
          onResponses={(form) => onSelect(form, 'responses')}
          onRemove={onRemoveSubPage}
        />
      ) : view === 'responses' ? (
        <ResponsesTab
          form={page}
          config={detail.data?.form}
          sheetConnected={Boolean(detail.data?.formWebhookUrl)}
        />
      ) : detail.data ? (
        view === 'integrations' ? (
          <div className='bg-card max-w-3xl rounded-2xl border p-4'>
            <IntegrationsPanel linkPage={detail.data} />
          </div>
        ) : view === 'analytics' ? (
          <AnalyticsTab linkPage={detail.data} />
        ) : (
          <DevicePreview
            aside={
              analyticsOpen ? (
                <div className='w-80'>
                  <AnalyticsSummary
                    linkPage={detail.data}
                    onShowAll={() => setView('analytics')}
                    onHide={toggleAnalytics}
                  />
                </div>
              ) : (
                <Button
                  variant='outline'
                  size='icon'
                  title='Mostrar análises'
                  aria-label='Mostrar análises'
                  onClick={toggleAnalytics}
                >
                  <BarChart3 className='size-4' />
                </Button>
              )
            }
          >
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

/** QR code for the page link (or any URL the user types), downloadable as a high-res PNG. */
function ShareTab({ defaultUrl, name }: { defaultUrl: string; name: string }) {
  const [value, setValue] = useState(defaultUrl);
  const [transparent, setTransparent] = useState(false);
  const [dataUrl, setDataUrl] = useState('');
  const text = value.trim();
  // Own page link gets tagged so scans show up as "qrcode" under Análises → origens.
  const qrText = text === defaultUrl ? `${defaultUrl}?utm_source=qrcode` : text;
  // Stale while the next one renders; empty input shows nothing.
  const qr = text ? dataUrl : '';

  useEffect(() => {
    if (!qrText) return;
    let active = true;
    void QRCode.toDataURL(qrText, {
      width: 2048,
      margin: 2,
      color: { light: transparent ? '#0000' : '#ffffff' },
    }).then((generated) => {
      if (active) setDataUrl(generated);
    });
    return () => {
      active = false;
    };
  }, [qrText, transparent]);

  return (
    <div className='grid w-full max-w-md gap-4'>
      <div className='grid gap-2'>
        <Label htmlFor='share-url'>Link</Label>
        <div className='flex gap-2'>
          <Input
            id='share-url'
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder='https://'
          />
          {value !== defaultUrl && (
            <Button
              variant='outline'
              onClick={() => setValue(defaultUrl)}
            >
              Restaurar
            </Button>
          )}
        </div>
      </div>
      <label className='flex items-center gap-2 text-sm'>
        <Switch
          checked={transparent}
          onCheckedChange={setTransparent}
        />
        Fundo transparente
      </label>
      {qr ? (
        <>
          <img
            src={qr}
            alt={`QR code de ${text}`}
            className={cn(
              'aspect-square w-full max-w-72 rounded-lg border',
              // Checkerboard shows the transparency in the preview.
              transparent
                ? 'bg-[repeating-conic-gradient(#e5e5e5_0_25%,#fff_0_50%)] bg-size-[16px_16px]'
                : 'bg-white',
            )}
          />
          <Button
            asChild
            className='w-fit'
          >
            <a
              href={qr}
              download={`qrcode-${name}.png`}
            >
              <QrCode className='size-4' />
              Baixar QR code (PNG 2048px)
            </a>
          </Button>
        </>
      ) : (
        <p className='text-muted-foreground text-sm'>
          Digite um link para gerar o QR code.
        </p>
      )}
    </div>
  );
}

/** A bio's post links, most accessed first (views in the plan's analytics window). */
function PostsTab({
  posts,
  onView,
  onRemove,
}: {
  posts: LinkPageSummary[];
  onView: (post: LinkPageSummary) => void;
  onRemove: (post: LinkPageSummary) => void;
}) {
  const overview = useLinkPagesOverviewUseCase();
  const views = new Map(
    (overview.data?.pages ?? []).map((page) => [page.id, page.pageViews]),
  );
  const viewsOf = (post: LinkPageSummary) => views.get(post.id) ?? 0;
  const [query, setQuery] = useState('');
  // '' = all networks, 'NONE' = posts without a network.
  const [network, setNetwork] = useState('');
  const sorted = [...posts].sort((a, b) => viewsOf(b) - viewsOf(a));
  const topId = sorted[0] && viewsOf(sorted[0]) > 0 ? sorted[0].id : undefined;
  const networks = [
    ...new Set(posts.flatMap((post) => post.postNetwork ?? [])),
  ];
  const term = query.trim().toLowerCase();
  const visible = sorted.filter(
    (post) =>
      (!term ||
        `${post.name} ${post.publicPath}`.toLowerCase().includes(term)) &&
      (!network || (post.postNetwork ?? 'NONE') === network),
  );
  const action =
    'text-muted-foreground hover:text-foreground hover:bg-muted flex size-8 shrink-0 items-center justify-center rounded-md';

  if (posts.length === 0) {
    return (
      <p className='text-muted-foreground text-sm'>
        Nenhum link de post ainda. Use “Novo link de post" acima.
      </p>
    );
  }

  return (
    <div className='grid gap-3'>
      <div className='flex flex-col gap-2 sm:flex-row'>
        <Input
          type='search'
          aria-label='Buscar posts'
          placeholder='Buscar por nome ou link'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className='sm:flex-1'
        />
        <Select
          aria-label='Filtrar por rede'
          value={network}
          onChange={(event) => setNetwork(event.target.value)}
          className='sm:w-48'
        >
          <option value=''>Todas as redes</option>
          {networks.map((value) => (
            <option
              key={value}
              value={value}
            >
              {socialPlatformLabels[value]}
            </option>
          ))}
          {posts.some((post) => !post.postNetwork) && (
            <option value='NONE'>Sem rede</option>
          )}
        </Select>
      </div>
      {visible.length === 0 ? (
        <p className='text-muted-foreground text-sm'>Nenhum post encontrado.</p>
      ) : (
        <ul className='bg-card divide-y rounded-xl border'>
          {visible.map((post) => (
            <li
              key={post.id}
              className='flex items-center gap-3 px-3 py-2'
            >
              <PostNetworkIcon post={post} />
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <span className='truncate text-sm font-medium'>
                    {post.name}
                  </span>
                  {post.id === topId && (
                    <span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f5e3c8] px-2 py-0.5 text-xs font-medium text-[#7a4d0f]'>
                      <Trophy className='size-3' />
                      Mais acessado
                    </span>
                  )}
                </div>
                <p className='text-muted-foreground truncate text-xs'>
                  /p/{post.publicPath}
                </p>
              </div>
              <span className='text-muted-foreground shrink-0 text-sm tabular-nums'>
                {viewsOf(post)} {viewsOf(post) === 1 ? 'acesso' : 'acessos'}
              </span>
              <div className='flex items-center'>
                <button
                  type='button'
                  onClick={() => onView(post)}
                  title='Visualizar'
                  aria-label={`Visualizar ${post.name}`}
                  className={action}
                >
                  <Eye className='size-4' />
                </button>
                <RouterLink
                  to={routes.linkPages.edit(post.id)}
                  title='Editar'
                  aria-label={`Editar ${post.name}`}
                  className={action}
                >
                  <Pencil className='size-4' />
                </RouterLink>
                <button
                  type='button'
                  onClick={() => onRemove(post)}
                  title='Excluir'
                  aria-label={`Excluir ${post.name}`}
                  className={cn(action, 'hover:text-destructive')}
                >
                  <Trash2 className='size-4' />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The post's configured network icon; generic post icon when none is set. */
function PostNetworkIcon({ post }: { post: LinkPageSummary }) {
  if (!post.postNetwork) return <PageIcon page={post} />;

  const Icon = socialPlatformIcons[post.postNetwork];
  const label = socialPlatformLabels[post.postNetwork];

  return (
    <span
      role='img'
      title={label}
      aria-label={label}
      className='bg-muted text-foreground flex size-6 shrink-0 items-center justify-center rounded-md'
    >
      <Icon className='size-3.5' />
    </span>
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

/**
 * Post sub-page (/p/:bio/:post, a destination for one social post) or, with
 * `kind='FORM'`, a form sub-page (/p/:bio/:form). Same flow, forms skip the URL.
 */
function NewPostForm({
  bio,
  kind = 'POST',
  onCreate,
}: {
  bio: LinkPageSummary;
  kind?: 'POST' | 'FORM';
  onCreate: (payload: {
    name: string;
    slug: string;
    postUrl: string | null;
  }) => void;
}) {
  const isForm = kind === 'FORM';
  const idPrefix = isForm ? 'form' : 'post';
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const slug = slugify(name);

  const title = isForm ? 'Novo formulário' : 'Novo link de post';

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setName('');
          setPostUrl('');
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='justify-start'
        >
          <Plus className='size-4' />
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className='grid gap-4'
          onSubmit={(event) => {
            event.preventDefault();
            onCreate({ name, slug, postUrl: postUrl || null });
          }}
        >
          <div className='grid gap-1'>
            <Label htmlFor={`${idPrefix}-name-${bio.id}`}>
              {isForm ? 'Nome do formulário' : 'Nome do post'}
            </Label>
            <Input
              id={`${idPrefix}-name-${bio.id}`}
              required
              autoFocus
              placeholder={isForm ? 'Orçamento' : 'Promo de terça'}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {slug && (
              <p className='text-muted-foreground truncate text-xs'>
                /p/{bio.publicPath}/{slug}
              </p>
            )}
          </div>
          {!isForm && (
            <div className='grid gap-1'>
              <Label htmlFor={`post-url-${bio.id}`}>
                Link do post (opcional)
              </Label>
              <Input
                id={`post-url-${bio.id}`}
                type='url'
                placeholder='https://instagram.com/p/...'
                value={postUrl}
                onChange={(event) => setPostUrl(event.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type='button'
                variant='ghost'
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type='submit'
              disabled={!slug}
            >
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
