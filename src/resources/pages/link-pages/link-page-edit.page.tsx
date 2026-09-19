import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  CalendarDays,
  Clock3,
  Globe2,
  GripVertical,
  Lock,
  MousePointerClick,
  Radio,
  Users,
} from 'lucide-react';
import {
  Action,
  AuthorizationSubject,
} from '@/app/modules/authorization/types/authorization.types';
import { useCan } from '@/app/modules/authorization/hooks/use-ability';
import {
  useGetLinkPageUseCase,
  useLinkPageAnalyticsInsightsUseCase,
  useLinkPageLinkClicksUseCase,
  useLinkPageMutations,
} from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import type {
  LinkPageAnalyticsGroupItem,
  LinkPageAnalyticsTarget,
  LinkPageAnalyticsTimeseriesPoint,
  LinkPageDetail,
  LinkPageFooterMode,
  LinkPageLink,
  LinkPageLinkKind,
  LinkPageLinkPlacement,
  SocialPlatform,
} from '@/app/modules/link-pages/types/link-pages.types';
import { Button } from '@/resources/components/ui/button';
import { ColorPicker } from '@/resources/components/ui/color-picker';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';
import { Select } from '@/resources/components/ui/select';
import { routes } from '@/shared/constants/router.constants';
import { cn } from '@/shared/lib/utils';
import { LinkPageRenderer } from './renderer/link-page-renderer.component';
import {
  socialPlatformIcons,
  socialPlatformLabels,
} from './renderer/social-platform-icons';

type Tab = 'content' | 'appearance' | 'settings' | 'analytics' | 'branding';
type AutosaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
type LinkClickCountMap = Record<string, number>;
type LinkPageLinkStyle = Pick<
  LinkPageLink,
  'backgroundColor' | 'borderColor' | 'borderEnabled' | 'textColor'
>;

const autosaveDelayMs = 700;
const defaultLinkStyle: LinkPageLinkStyle = {
  backgroundColor: '#FFFFFF',
  borderColor: '#E5E7EB',
  borderEnabled: true,
  textColor: '#111827',
};
const whatsAppLinkStyle: LinkPageLinkStyle = {
  backgroundColor: '#25D366',
  borderColor: '#25D366',
  borderEnabled: false,
  textColor: '#FFFFFF',
};
const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'content', label: 'Conteúdo' },
  { id: 'appearance', label: 'Aparência' },
  { id: 'settings', label: 'Configurações' },
  { id: 'analytics', label: 'Análises' },
  { id: 'branding', label: 'Marca' },
];

function dateInputValue(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return date.toISOString().slice(0, 10);
}

function startOfDayIso(value: string) {
  return `${value}T00:00:00.000Z`;
}

function endOfDayIso(value: string) {
  return `${value}T23:59:59.999Z`;
}

function toNumber(value: number | string | undefined) {
  return Number(value ?? 0);
}

function formatNumber(value: number | string | undefined) {
  return new Intl.NumberFormat('pt-BR').format(toNumber(value));
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDuration(milliseconds: number) {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }

  return `${Math.round(milliseconds / 1000)}s`;
}

function targetLabel(
  linkPage: LinkPageDetail,
  target: LinkPageAnalyticsTarget,
) {
  if (
    target.targetType === 'HORIZONTAL_LINK' ||
    target.targetType === 'VERTICAL_LINK'
  ) {
    return (
      linkPage.links.find((link) => link.id === target.targetId)?.label ??
      'Link removido'
    );
  }

  if (target.targetType === 'SOCIAL_LINK') {
    const platform = linkPage.socialLinks.find(
      (link) => link.id === target.targetId,
    )?.platform;

    return platform ? socialPlatformLabels[platform] : 'Rede removida';
  }

  return (
    linkPage.images.find((image) => image.id === target.targetId)?.altText ??
    'Imagem'
  );
}

export function reorderLinksForDrop(
  links: LinkPageLink[],
  activeId: string,
  overId: string,
) {
  const oldIndex = links.findIndex((link) => link.id === activeId);
  const newIndex = links.findIndex((link) => link.id === overId);

  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
    return links;
  }

  return arrayMove(links, oldIndex, newIndex).map((link, sortOrder) => ({
    ...link,
    sortOrder,
  }));
}

function useAutosaveSection<TPayload>(
  payload: TPayload,
  save: (payload: TPayload) => Promise<unknown>,
  enabled = true,
) {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const signature = JSON.stringify(payload);
  const currentSignatureRef = useRef(signature);
  const payloadRef = useRef(payload);
  const saveRef = useRef(save);
  const savedSignatureRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    currentSignatureRef.current = signature;
    payloadRef.current = payload;
  }, [payload, signature]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    if (savedSignatureRef.current === null) {
      savedSignatureRef.current = signature;
      return undefined;
    }

    if (savedSignatureRef.current === signature) {
      return undefined;
    }

    setStatus('dirty');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const targetSignature = signature;
      const targetPayload = payloadRef.current;

      setStatus('saving');

      void saveRef
        .current(targetPayload)
        .then(() => {
          savedSignatureRef.current = targetSignature;
          setStatus(
            currentSignatureRef.current === targetSignature ? 'saved' : 'dirty',
          );
        })
        .catch(() => {
          setStatus(
            currentSignatureRef.current === targetSignature ? 'error' : 'dirty',
          );
        });
    }, autosaveDelayMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, signature]);

  return status;
}

export function LinkPageEditPage() {
  const { id } = useParams();
  const { data, isLoading } = useGetLinkPageUseCase(id);

  if (isLoading) {
    return <div className='rounded-md border p-4'>Carregando LinkPage...</div>;
  }

  if (!data) {
    return (
      <div className='rounded-md border p-4'>LinkPage não encontrada.</div>
    );
  }

  return (
    <LinkPageEditor
      key={`${data.id}-${data.updatedAt}-${data.links.length}-${data.socialLinks.length}-${data.images.length}`}
      linkPage={data}
    />
  );
}

function LinkPageEditor({ linkPage }: { linkPage: LinkPageDetail }) {
  const [tab, setTab] = useState<Tab>('content');
  const [draft, setDraft] = useState<LinkPageDetail>(linkPage);
  const mutations = useLinkPageMutations(linkPage.id);
  const canViewAnalytics = useCan(
    Action.ViewAnalytics,
    AuthorizationSubject.LinkPageAnalytics,
  );
  const canManageWhiteLabel = useCan(
    Action.ManageWhiteLabel,
    AuthorizationSubject.LinkPageWhiteLabel,
  );
  const linkClicks = useLinkPageLinkClicksUseCase(draft.id, canViewAnalytics);
  const clicksByLinkId = (
    linkClicks.data?.items ?? []
  ).reduce<LinkClickCountMap>((acc, item) => {
    acc[item.linkId] = Number(item.clicks);
    return acc;
  }, {});

  const headerStatus = useAutosaveSection(
    {
      avatarUrl: draft.avatarUrl,
      title: draft.title,
      subtitle: draft.subtitle,
    },
    (payload) => mutations.update.mutateAsync(payload),
  );
  const appearanceStatus = useAutosaveSection(
    {
      layout: draft.layout,
      backgroundType: draft.backgroundType,
      backgroundColor: draft.backgroundColor,
      backgroundImageUrl: draft.backgroundImageUrl,
    },
    (payload) => mutations.update.mutateAsync(payload),
  );
  const settingsStatus = useAutosaveSection(
    {
      name: draft.name,
      slug: draft.slug,
      status: draft.status,
    },
    (payload) => mutations.update.mutateAsync(payload),
  );
  const brandingStatus = useAutosaveSection(
    {
      footerMode: draft.footerMode,
      footerText: draft.footerText,
      footerUrl: draft.footerUrl,
      footerLogoUrl: draft.footerLogoUrl,
    },
    (payload) => mutations.updateFooter.mutateAsync(payload),
  );

  return (
    <div className='grid min-h-full gap-4 md:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_400px]'>
      <section className='min-w-0 rounded-md border'>
        <div className='flex gap-1 overflow-x-auto border-b p-2'>
          {tabs.map((item) => (
            <Button
              key={item.id}
              type='button'
              size='sm'
              variant={tab === item.id ? 'default' : 'ghost'}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className='p-4'>
          {tab === 'content' && (
            <ContentTab
              draft={draft}
              setDraft={setDraft}
              mutations={mutations}
              headerStatus={headerStatus}
              canViewAnalytics={canViewAnalytics}
              clicksByLinkId={clicksByLinkId}
            />
          )}
          {tab === 'appearance' && (
            <AppearanceTab
              draft={draft}
              setDraft={setDraft}
              status={appearanceStatus}
            />
          )}
          {tab === 'settings' && (
            <SettingsTab
              draft={draft}
              setDraft={setDraft}
              status={settingsStatus}
            />
          )}
          {tab === 'analytics' && (
            <AnalyticsTab
              linkPage={draft}
              enabled={canViewAnalytics}
            />
          )}
          {tab === 'branding' && (
            <BrandingTab
              draft={draft}
              setDraft={setDraft}
              status={brandingStatus}
              enabled={canManageWhiteLabel}
            />
          )}
        </div>
      </section>

      <aside
        data-testid='link-page-live-preview'
        className='self-start rounded-md border bg-slate-100 p-3 md:sticky md:top-4 dark:bg-slate-950'
      >
        <p className='mb-3 text-sm font-medium'>Prévia ao vivo</p>
        <div className='h-[480px] overflow-hidden rounded-md sm:h-[500px] xl:h-[530px]'>
          <div className='mx-auto w-full max-w-[390px] origin-top scale-[0.64] sm:scale-[0.68] xl:scale-[0.72]'>
            <LinkPageRenderer
              linkPage={draft}
              preview
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='grid gap-2'>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ColorField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className='grid gap-2 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='border-input bg-background flex h-12 items-center gap-2 rounded-md border px-2 shadow-xs'>
        <ColorPicker
          label={label}
          value={value}
          onChange={onChange}
          className='w-full border-0 shadow-none'
        />
      </span>
    </label>
  );
}

function BorderEnabledField({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className='border-input bg-background flex h-12 items-center gap-2 rounded-md border px-3 text-sm shadow-xs'>
      <input
        type='checkbox'
        className='size-4'
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      Borda
    </label>
  );
}

function CompactColorField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className='text-muted-foreground flex items-center gap-1 text-xs'>
      <span>{label}</span>
      <ColorPicker
        label={label}
        value={value}
        onChange={onChange}
        className='h-7 w-7 p-0 [&>span:last-child]:hidden'
      />
    </label>
  );
}

function EditorSection({
  action,
  children,
  status,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  status?: AutosaveStatus;
  title: string;
}) {
  return (
    <section className='space-y-4 border-b pb-6 last:border-b-0 last:pb-0'>
      <div className='flex min-h-8 items-center justify-between gap-3'>
        <h2 className='font-semibold'>{title}</h2>
        {status ? <AutosaveStatusButton status={status} /> : action}
      </div>
      {children}
    </section>
  );
}

function AutosaveStatusButton({ status }: { status: AutosaveStatus }) {
  if (status === 'idle') {
    return null;
  }

  if (status === 'saving') {
    return (
      <Button
        type='button'
        size='sm'
        variant='ghost'
        isSaving
      />
    );
  }

  const labelByStatus: Record<
    Exclude<AutosaveStatus, 'idle' | 'saving'>,
    string
  > = {
    dirty: 'Aguardando...',
    error: 'Erro ao salvar',
    saved: 'Salvo',
  };

  return (
    <Button
      type='button'
      size='sm'
      variant='ghost'
      className='text-muted-foreground pointer-events-none'
      disabled
    >
      {labelByStatus[status]}
    </Button>
  );
}

function ContentTab({
  canViewAnalytics,
  clicksByLinkId,
  draft,
  headerStatus,
  mutations,
  setDraft,
}: {
  canViewAnalytics: boolean;
  clicksByLinkId: LinkClickCountMap;
  draft: LinkPageDetail;
  headerStatus: AutosaveStatus;
  mutations: ReturnType<typeof useLinkPageMutations>;
  setDraft: Dispatch<SetStateAction<LinkPageDetail>>;
}) {
  return (
    <div className='space-y-6'>
      <EditorSection
        title='Cabeçalho'
        status={headerStatus}
      >
        <div className='grid gap-3 md:grid-cols-2'>
          <Field label='URL do avatar'>
            <Input
              value={draft.avatarUrl ?? ''}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  avatarUrl: event.target.value || null,
                }))
              }
            />
          </Field>
          <Field label='Título'>
            <Input
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </Field>
          <Field label='Subtítulo'>
            <Input
              value={draft.subtitle ?? ''}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  subtitle: event.target.value || null,
                }))
              }
            />
          </Field>
        </div>
      </EditorSection>

      <LinksManager
        canViewAnalytics={canViewAnalytics}
        clicksByLinkId={clicksByLinkId}
        draft={draft}
        mutations={mutations}
        setDraft={setDraft}
      />
      <SocialManager
        draft={draft}
        mutations={mutations}
      />
      <ImagesManager
        draft={draft}
        mutations={mutations}
      />
    </div>
  );
}

function LinksManager({
  canViewAnalytics,
  clicksByLinkId,
  draft,
  mutations,
  setDraft,
}: {
  canViewAnalytics: boolean;
  clicksByLinkId: LinkClickCountMap;
  draft: LinkPageDetail;
  mutations: ReturnType<typeof useLinkPageMutations>;
  setDraft: Dispatch<SetStateAction<LinkPageDetail>>;
}) {
  const [newLinkKind, setNewLinkKind] = useState<LinkPageLinkKind>('LINK');
  const [newLinkStyle, setNewLinkStyle] =
    useState<LinkPageLinkStyle>(defaultLinkStyle);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const updateNewLinkStyle = (style: Partial<LinkPageLinkStyle>) => {
    setNewLinkStyle((current) => ({ ...current, ...style }));
  };

  const handleKindChange = (kind: LinkPageLinkKind) => {
    setNewLinkKind(kind);
    setNewLinkStyle(kind === 'CONTACT' ? whatsAppLinkStyle : defaultLinkStyle);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const placement = String(
      formData.get('placement'),
    ) as LinkPageLinkPlacement;
    const label = String(formData.get('label') ?? '');
    const value = String(formData.get('value') ?? '');

    mutations.createLink.mutate({
      placement,
      kind: newLinkKind,
      label,
      url: newLinkKind === 'LINK' ? value : null,
      contactType: newLinkKind === 'CONTACT' ? 'WHATSAPP' : null,
      contactValue: newLinkKind === 'CONTACT' ? value : null,
      textColor: newLinkStyle.textColor,
      backgroundColor: newLinkStyle.backgroundColor,
      borderColor: newLinkStyle.borderColor,
      borderEnabled: newLinkStyle.borderEnabled,
      sortOrder: draft.links.length,
      active: true,
    });
    event.currentTarget.reset();
  };

  const handleUpdateLinkStyle = (
    linkId: string,
    style: Partial<LinkPageLinkStyle>,
  ) => {
    setDraft((current) => ({
      ...current,
      links: current.links.map((link) =>
        link.id === linkId ? { ...link, ...style } : link,
      ),
    }));
    mutations.updateLink.mutate({ linkId, payload: style });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const reorderedLinks = reorderLinksForDrop(
      draft.links,
      String(active.id),
      String(over.id),
    );

    if (reorderedLinks === draft.links) {
      return;
    }

    setDraft((current) => ({
      ...current,
      links: reorderedLinks,
    }));
    mutations.reorderLinks.mutate(
      reorderedLinks.map((link) => ({
        id: link.id,
        sortOrder: link.sortOrder,
      })),
    );
  };

  return (
    <EditorSection
      title='Links'
      action={
        mutations.reorderLinks.isPending ? (
          <Button
            type='button'
            size='sm'
            variant='ghost'
            isSaving
          />
        ) : null
      }
    >
      <form
        className='grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]'
        onSubmit={submit}
      >
        <Select name='placement'>
          <option value='VERTICAL'>Vertical</option>
          <option value='HORIZONTAL'>Horizontal</option>
        </Select>
        <Select
          name='kind'
          value={newLinkKind}
          onChange={(event) =>
            handleKindChange(event.target.value as LinkPageLinkKind)
          }
        >
          <option value='LINK'>Link</option>
          <option value='CONTACT'>WhatsApp</option>
        </Select>
        <Input
          name='label'
          placeholder='Rótulo'
          required
        />
        <Input
          name='value'
          placeholder={newLinkKind === 'CONTACT' ? 'WhatsApp com DDD' : 'URL'}
          required
        />
        <Button
          type='submit'
          className='h-12'
        >
          Adicionar
        </Button>
        <div className='bg-muted/20 rounded-md border p-3 md:col-span-5'>
          <div className='grid gap-3 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]'>
            <ColorField
              label='Cor do texto'
              value={newLinkStyle.textColor}
              onChange={(textColor) => updateNewLinkStyle({ textColor })}
            />
            <ColorField
              label='Cor do fundo'
              value={newLinkStyle.backgroundColor}
              onChange={(backgroundColor) =>
                updateNewLinkStyle({ backgroundColor })
              }
            />
            <ColorField
              label='Cor da borda'
              value={newLinkStyle.borderColor}
              onChange={(borderColor) => updateNewLinkStyle({ borderColor })}
            />
            <div className='flex items-end'>
              <BorderEnabledField
                checked={newLinkStyle.borderEnabled}
                onChange={(borderEnabled) =>
                  updateNewLinkStyle({ borderEnabled })
                }
              />
            </div>
          </div>
        </div>
      </form>
      {draft.links.length ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={draft.links.map((link) => link.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className='grid gap-2'>
              {draft.links.map((link) => (
                <SortableLinkRow
                  key={link.id}
                  clicks={
                    canViewAnalytics
                      ? (clicksByLinkId[link.id] ?? 0)
                      : undefined
                  }
                  link={link}
                  onRemove={() => mutations.deleteLink.mutate(link.id)}
                  onUpdateStyle={(style) =>
                    handleUpdateLinkStyle(link.id, style)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className='text-muted-foreground rounded-md border border-dashed p-3 text-sm'>
          Nenhum link adicionado ainda.
        </p>
      )}
    </EditorSection>
  );
}

function SortableLinkRow({
  clicks,
  link,
  onRemove,
  onUpdateStyle,
}: {
  clicks?: number;
  link: LinkPageLink;
  onRemove: () => void;
  onUpdateStyle: (style: Partial<LinkPageLinkStyle>) => void;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: link.id });
  const detail = link.kind === 'CONTACT' ? 'WhatsApp' : link.url;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'bg-background flex flex-wrap items-center gap-2 rounded-md border p-2 text-sm shadow-xs',
        isDragging && 'relative z-10 opacity-70',
      )}
    >
      <button
        type='button'
        className='text-muted-foreground hover:bg-accent flex size-9 cursor-grab items-center justify-center rounded-md transition-colors active:cursor-grabbing'
        aria-label={`Arrastar ${link.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className='size-4' />
      </button>
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium'>{link.label}</p>
        <div className='text-muted-foreground mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs'>
          <span className='min-w-0 truncate'>
            {link.placement === 'VERTICAL' ? 'Vertical' : 'Horizontal'} ·{' '}
            {detail}
          </span>
          {clicks !== undefined && (
            <span className='inline-flex shrink-0 items-center gap-1'>
              <MousePointerClick
                className='size-3'
                aria-hidden='true'
              />
              {formatNumber(clicks)} cliques
            </span>
          )}
        </div>
      </div>
      <div className='flex flex-wrap items-center gap-3'>
        <CompactColorField
          label={`Texto de ${link.label}`}
          value={link.textColor}
          onChange={(textColor) => onUpdateStyle({ textColor })}
        />
        <CompactColorField
          label={`Fundo de ${link.label}`}
          value={link.backgroundColor}
          onChange={(backgroundColor) => onUpdateStyle({ backgroundColor })}
        />
        <CompactColorField
          label={`Borda de ${link.label}`}
          value={link.borderColor}
          onChange={(borderColor) => onUpdateStyle({ borderColor })}
        />
        <label className='text-muted-foreground flex items-center gap-1 text-xs'>
          <input
            type='checkbox'
            className='size-4'
            checked={link.borderEnabled}
            onChange={(event) =>
              onUpdateStyle({ borderEnabled: event.target.checked })
            }
          />
          Borda
        </label>
      </div>
      <Button
        type='button'
        size='sm'
        variant='outline'
        onClick={onRemove}
      >
        Remover
      </Button>
    </div>
  );
}

function SocialManager({
  draft,
  mutations,
}: {
  draft: LinkPageDetail;
  mutations: ReturnType<typeof useLinkPageMutations>;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mutations.createSocialLink.mutate({
      platform: String(formData.get('platform')) as SocialPlatform,
      url: String(formData.get('url') ?? ''),
      sortOrder: draft.socialLinks.length,
      active: true,
    });
    event.currentTarget.reset();
  };

  return (
    <EditorSection title='Redes sociais'>
      <form
        className='grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]'
        onSubmit={submit}
      >
        <Select name='platform'>
          {Object.entries(socialPlatformLabels).map(([platform, label]) => (
            <option
              key={platform}
              value={platform}
            >
              {label}
            </option>
          ))}
        </Select>
        <Input
          name='url'
          placeholder='https://...'
          required
        />
        <Button
          type='submit'
          className='h-12'
        >
          Adicionar
        </Button>
      </form>
      <div className='grid gap-2'>
        {draft.socialLinks.map((socialLink) => {
          const Icon = socialPlatformIcons[socialLink.platform];
          const label = socialPlatformLabels[socialLink.platform];

          return (
            <div
              key={socialLink.id}
              className='bg-background flex items-center justify-between rounded-md border p-2 text-sm shadow-xs'
            >
              <span className='flex min-w-0 items-center gap-2'>
                <Icon
                  className='size-4 shrink-0'
                  aria-hidden='true'
                />
                <span className='truncate'>{label}</span>
              </span>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={() => mutations.deleteSocialLink.mutate(socialLink.id)}
              >
                Remover
              </Button>
            </div>
          );
        })}
      </div>
    </EditorSection>
  );
}

function ImagesManager({
  draft,
  mutations,
}: {
  draft: LinkPageDetail;
  mutations: ReturnType<typeof useLinkPageMutations>;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mutations.createImage.mutate({
      imageUrl: String(formData.get('imageUrl') ?? ''),
      altText: String(formData.get('altText') ?? '') || null,
      targetUrl: String(formData.get('targetUrl') ?? '') || null,
      sortOrder: draft.images.length,
      active: true,
    });
    event.currentTarget.reset();
  };

  return (
    <EditorSection title='Imagens'>
      <form
        className='grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]'
        onSubmit={submit}
      >
        <Input
          name='imageUrl'
          placeholder='URL da imagem'
          required
        />
        <Input
          name='altText'
          placeholder='Texto alternativo'
        />
        <Input
          name='targetUrl'
          placeholder='URL destino'
        />
        <Button
          type='submit'
          className='h-12'
        >
          Adicionar
        </Button>
      </form>
      <div className='grid gap-2'>
        {draft.images.map((image) => (
          <div
            key={image.id}
            className='bg-background flex items-center justify-between gap-3 rounded-md border p-2 text-sm shadow-xs'
          >
            <span className='truncate'>{image.imageUrl}</span>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => mutations.deleteImage.mutate(image.id)}
            >
              Remover
            </Button>
          </div>
        ))}
      </div>
    </EditorSection>
  );
}

function AppearanceTab({
  draft,
  status,
  setDraft,
}: {
  draft: LinkPageDetail;
  status: AutosaveStatus;
  setDraft: Dispatch<SetStateAction<LinkPageDetail>>;
}) {
  return (
    <EditorSection
      title='Aparência'
      status={status}
    >
      <div className='grid gap-4 md:grid-cols-2'>
        <Field label='Modelo'>
          <Select
            value={draft.layout}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                layout: event.target.value as LinkPageDetail['layout'],
              }))
            }
          >
            <option value='LAYOUT_1'>Modelo 1</option>
            <option value='LAYOUT_2'>Modelo 2</option>
            <option value='LAYOUT_3'>Modelo 3</option>
          </Select>
        </Field>
        <Field label='Plano de fundo'>
          <Select
            value={draft.backgroundType}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                backgroundType: event.target
                  .value as LinkPageDetail['backgroundType'],
              }))
            }
          >
            <option value='SOLID'>Cor sólida</option>
            <option value='IMAGE'>Imagem</option>
          </Select>
        </Field>
        <Field label='Cor sólida'>
          <ColorPicker
            label='Cor sólida'
            value={draft.backgroundColor}
            onChange={(backgroundColor) =>
              setDraft((current) => ({ ...current, backgroundColor }))
            }
          />
        </Field>
        <Field label='Imagem de fundo'>
          <Input
            value={draft.backgroundImageUrl ?? ''}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                backgroundImageUrl: event.target.value || null,
              }))
            }
          />
        </Field>
      </div>
    </EditorSection>
  );
}

function SettingsTab({
  draft,
  status,
  setDraft,
}: {
  draft: LinkPageDetail;
  status: AutosaveStatus;
  setDraft: Dispatch<SetStateAction<LinkPageDetail>>;
}) {
  return (
    <EditorSection
      title='Configurações'
      status={status}
    >
      <div className='grid gap-4 md:grid-cols-2'>
        <Field label='Nome interno'>
          <Input
            value={draft.name}
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
          />
        </Field>
        <Field label='Slug'>
          <Input
            value={draft.slug}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                slug: event.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, ''),
              }))
            }
          />
        </Field>
        <Field label='Status'>
          <Select
            value={draft.status}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                status: event.target.value as LinkPageDetail['status'],
              }))
            }
          >
            <option value='ACTIVE'>Ativa</option>
            <option value='INACTIVE'>Inativa</option>
          </Select>
        </Field>
        <div className='rounded-md border p-3 text-sm'>
          <p className='text-muted-foreground'>URL padrão</p>
          <p className='font-medium'>/p/{draft.slug}</p>
        </div>
      </div>
    </EditorSection>
  );
}

function AnalyticsTab({
  enabled,
  linkPage,
}: {
  enabled: boolean;
  linkPage: LinkPageDetail;
}) {
  const [fromDate, setFromDate] = useState(() => dateInputValue(30));
  const [toDate, setToDate] = useState(() => dateInputValue(0));
  const insights = useLinkPageAnalyticsInsightsUseCase(
    linkPage.id,
    {
      from: fromDate ? startOfDayIso(fromDate) : undefined,
      to: toDate ? endOfDayIso(toDate) : undefined,
    },
    enabled,
  );
  const data = insights.data;
  const isFull = data?.tier === 'FULL';
  const summary = data?.summary;

  if (!enabled) {
    return (
      <div className='bg-muted/40 flex items-center gap-3 rounded-md border p-4 text-sm'>
        <Lock className='size-4' />
        As análises estão disponíveis em planos com o recurso habilitado.
      </div>
    );
  }

  return (
    <div className='space-y-5'>
      <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
        <div>
          <div className='flex items-center gap-2 font-medium'>
            <BarChart3 className='size-4' />
            Análises
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            {isFull
              ? 'Análises completas por período.'
              : 'Plano grátis: janela básica fixa dos últimos 7 dias.'}
          </p>
        </div>
        {isFull && (
          <div className='grid gap-2 sm:grid-cols-2'>
            <Field label='De'>
              <Input
                type='date'
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </Field>
            <Field label='Até'>
              <Input
                type='date'
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </Field>
          </div>
        )}
      </div>

      {insights.isLoading && (
        <div className='rounded-md border p-4 text-sm'>
          Carregando análises...
        </div>
      )}

      <div className='grid gap-3 md:grid-cols-3 xl:grid-cols-6'>
        <MetricCard
          icon={<Radio className='size-4' />}
          label='Online agora'
          value={formatNumber(summary?.onlineNow)}
        />
        <MetricCard
          icon={<Activity className='size-4' />}
          label='Visualizações'
          value={formatNumber(summary?.pageViews)}
        />
        <MetricCard
          icon={<Users className='size-4' />}
          label='Visitantes'
          value={formatNumber(summary?.uniqueVisitors)}
        />
        <MetricCard
          icon={<MousePointerClick className='size-4' />}
          label='Cliques'
          value={formatNumber(summary?.totalClicks)}
        />
        <MetricCard
          icon={<BarChart3 className='size-4' />}
          label='CTR'
          value={formatPercent(summary?.clickThroughRate ?? 0)}
        />
        <MetricCard
          icon={<Clock3 className='size-4' />}
          label='Duração média'
          value={formatDuration(summary?.averageDurationMs ?? 0)}
        />
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]'>
        <AnalyticsPanel
          title='Principais links'
          icon={<MousePointerClick className='size-4' />}
        >
          <RankedList
            emptyLabel='Nenhum clique registrado no período.'
            items={(data?.topTargets ?? []).map((target) => ({
              label: targetLabel(linkPage, target),
              value: formatNumber(target.clicks),
            }))}
          />
        </AnalyticsPanel>

        <AnalyticsPanel
          title='Visitas por dia'
          icon={<CalendarDays className='size-4' />}
          locked={!data?.limits.advancedDimensionsEnabled}
        >
          {data?.limits.advancedDimensionsEnabled ? (
            <TimeseriesBars points={data.timeseries} />
          ) : (
            <LockedAnalyticsLabel />
          )}
        </AnalyticsPanel>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <AnalyticsGroupPanel
          title='Origens'
          items={data?.sources ?? []}
          locked={!data?.limits.advancedDimensionsEnabled}
        />
        <AnalyticsGroupPanel
          title='Dispositivos'
          items={data?.devices ?? []}
          locked={!data?.limits.advancedDimensionsEnabled}
        />
        <AnalyticsGroupPanel
          title='Países'
          items={data?.countries ?? []}
          locked={!data?.limits.advancedDimensionsEnabled}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className='rounded-md border p-3'>
      <div className='text-muted-foreground flex items-center gap-2 text-xs'>
        {icon}
        <span>{label}</span>
      </div>
      <p className='mt-2 text-xl font-semibold'>{value}</p>
    </div>
  );
}

function AnalyticsPanel({
  children,
  icon,
  locked = false,
  title,
}: {
  children: ReactNode;
  icon?: ReactNode;
  locked?: boolean;
  title: string;
}) {
  return (
    <section className='rounded-md border p-4'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2 font-medium'>
          {icon}
          {title}
        </div>
        {locked && <Lock className='text-muted-foreground size-4' />}
      </div>
      <div className='mt-3'>{children}</div>
    </section>
  );
}

function RankedList({
  emptyLabel,
  items,
}: {
  emptyLabel: string;
  items: Array<{ label: string; value: string }>;
}) {
  if (!items.length) {
    return <p className='text-muted-foreground text-sm'>{emptyLabel}</p>;
  }

  return (
    <div className='grid gap-2'>
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className='bg-muted/30 flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm'
        >
          <span className='min-w-0 truncate'>
            {index + 1}. {item.label}
          </span>
          <span className='font-medium'>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function TimeseriesBars({
  points,
}: {
  points: LinkPageAnalyticsTimeseriesPoint[];
}) {
  const max = Math.max(...points.map((point) => toNumber(point.count)), 0);

  if (!points.length) {
    return (
      <p className='text-muted-foreground text-sm'>Sem visitas no período.</p>
    );
  }

  return (
    <div className='flex h-44 items-end gap-1'>
      {points.map((point) => {
        const count = toNumber(point.count);
        const height = max ? Math.max(6, (count / max) * 100) : 6;
        const date = new Date(point.date);

        return (
          <div
            key={point.date}
            className='flex min-w-5 flex-1 flex-col items-center gap-2'
            title={`${date.toLocaleDateString('pt-BR')}: ${formatNumber(count)}`}
          >
            <div
              className='bg-primary w-full rounded-t-sm'
              style={{ height: `${height}%` }}
            />
            <span className='text-muted-foreground text-[10px]'>
              {date.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LockedAnalyticsLabel() {
  return (
    <p className='text-muted-foreground text-sm'>
      Disponível nos planos Agência e Personalizado.
    </p>
  );
}

function AnalyticsGroupPanel({
  items,
  locked,
  title,
}: {
  items: LinkPageAnalyticsGroupItem[];
  locked: boolean;
  title: string;
}) {
  return (
    <AnalyticsPanel
      title={title}
      locked={locked}
    >
      {locked ? (
        <LockedAnalyticsLabel />
      ) : (
        <RankedList
          emptyLabel='Sem dados no período.'
          items={items.map((item) => ({
            label: item.label,
            value: formatNumber(item.count),
          }))}
        />
      )}
    </AnalyticsPanel>
  );
}

function BrandingTab({
  draft,
  enabled,
  status,
  setDraft,
}: {
  draft: LinkPageDetail;
  enabled: boolean;
  status: AutosaveStatus;
  setDraft: Dispatch<SetStateAction<LinkPageDetail>>;
}) {
  return (
    <EditorSection
      title='Marca'
      status={status}
    >
      <div className='bg-muted/40 flex flex-col gap-3 rounded-md border p-4 text-sm sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-start gap-3'>
          <Globe2 className='mt-0.5 size-4 shrink-0' />
          <div>
            <p className='font-medium'>Domínio próprio</p>
            <p className='text-muted-foreground mt-1'>
              O apontamento DNS fica em LinkPages, no painel Domínio customizado
              da empresa.
            </p>
          </div>
        </div>
        <Button
          asChild
          size='sm'
          variant='outline'
          className='shrink-0'
        >
          <RouterLink to={routes.linkPages.list}>Configurar domínio</RouterLink>
        </Button>
      </div>
      {!enabled && (
        <div className='bg-muted/40 flex items-center gap-3 rounded-md border p-4 text-sm'>
          <Lock className='size-4' />
          Marca branca está disponível em planos com o recurso habilitado. O
          modo Com LinksBuds permanece permitido.
        </div>
      )}
      <Field label='Rodapé'>
        <Select
          value={draft.footerMode}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              footerMode: event.target.value as LinkPageFooterMode,
            }))
          }
        >
          <option value='LINKSBUDS'>Com LinksBuds</option>
          <option
            value='CUSTOM'
            disabled={!enabled}
          >
            Rodapé personalizado
          </option>
          <option
            value='HIDDEN'
            disabled={!enabled}
          >
            Ocultar rodapé
          </option>
        </Select>
      </Field>
      <div className='grid gap-3 md:grid-cols-3'>
        <Input
          placeholder='Texto'
          value={draft.footerText ?? ''}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              footerText: event.target.value || null,
            }))
          }
        />
        <Input
          placeholder='URL'
          value={draft.footerUrl ?? ''}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              footerUrl: event.target.value || null,
            }))
          }
        />
        <Input
          placeholder='URL do logo'
          value={draft.footerLogoUrl ?? ''}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              footerLogoUrl: event.target.value || null,
            }))
          }
        />
      </div>
    </EditorSection>
  );
}
