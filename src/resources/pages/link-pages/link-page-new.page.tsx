import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useLinkPageMutations } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import type {
  LinkPageDetail,
  LinkPageLayout,
} from '@/app/modules/link-pages/types/link-pages.types';
import { BackButton } from '@/resources/components/base/back-button/back-button.component';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { routes } from '@/shared/constants/router.constants';
import { LinkPageRenderer } from './renderer/link-page-renderer.component';

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const layoutOptions: Array<{
  value: LinkPageLayout;
  label: string;
  description: string;
}> = [
  {
    value: 'LAYOUT_1',
    label: 'Layout 1',
    description: 'Centralizado com links em lista',
  },
  {
    value: 'LAYOUT_2',
    label: 'Layout 2',
    description: 'Destaques horizontais no topo',
  },
  {
    value: 'LAYOUT_3',
    label: 'Layout 3',
    description: 'Visual editorial com blocos',
  },
];

function buildPreviewLinkPage({
  layout,
  name,
  slug,
}: {
  layout: LinkPageLayout;
  name: string;
  slug: string;
}): LinkPageDetail {
  const title = name.trim() || 'Sua nova LinkPage';
  const previewSlug = slug.trim() || 'slug-da-pagina';

  return {
    id: 'preview',
    companyId: 'preview-company',
    name: title,
    slug: previewSlug,
    publicPath: previewSlug,
    type: 'CLIENT',
    parentPageId: null,
    postNetwork: null,
    postUrl: null,
    status: 'ACTIVE',
    layout,
    title,
    subtitle: `linkbuds.com/p/${previewSlug}`,
    backgroundType: 'SOLID',
    backgroundColor: '#F8FAFC',
    backgroundImageUrl: null,
    avatarUrl: null,
    footerMode: 'LINKBUDS',
    footerText: null,
    footerUrl: null,
    footerLogoUrl: null,
    gtmContainerId: null,
    ga4MeasurementId: null,
    links: [
      {
        id: 'preview-horizontal',
        placement: 'HORIZONTAL',
        kind: 'LINK',
        label: 'Destaque',
        url: 'https://example.com',
        contactType: null,
        contactValue: null,
        textColor: '#111827',
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        borderEnabled: true,
        sortOrder: 0,
        active: true,
      },
      {
        id: 'preview-vertical-1',
        placement: 'VERTICAL',
        kind: 'LINK',
        label: 'Agendar atendimento',
        url: 'https://example.com',
        contactType: null,
        contactValue: null,
        textColor: '#FFFFFF',
        backgroundColor: '#111827',
        borderColor: '#111827',
        borderEnabled: true,
        sortOrder: 1,
        active: true,
      },
      {
        id: 'preview-vertical-2',
        placement: 'VERTICAL',
        kind: 'LINK',
        label: 'Conhecer serviços',
        url: 'https://example.com',
        contactType: null,
        contactValue: null,
        textColor: '#111827',
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        borderEnabled: true,
        sortOrder: 2,
        active: true,
      },
    ],
    socialLinks: [
      {
        id: 'preview-social',
        platform: 'INSTAGRAM',
        url: 'https://example.com',
        sortOrder: 0,
        active: true,
      },
    ],
    images: [],
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  };
}

function LayoutMiniPreview({ layout }: { layout: LinkPageLayout }) {
  return (
    <div className='bg-muted/50 flex h-24 flex-col gap-2 rounded-md border p-3'>
      <div className='mx-auto size-7 rounded-full bg-slate-300' />
      {layout === 'LAYOUT_2' && (
        <div className='grid grid-cols-2 gap-1'>
          <span className='h-7 rounded bg-slate-300' />
          <span className='h-7 rounded bg-slate-200' />
        </div>
      )}
      {layout === 'LAYOUT_3' && <span className='h-8 rounded bg-slate-300' />}
      <span className='h-3 rounded bg-slate-300' />
      <span className='h-3 rounded bg-slate-200' />
    </div>
  );
}

export function LinkPageNewPage() {
  const navigate = useNavigate();
  const { create } = useLinkPageMutations();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [layout, setLayout] = useState<LinkPageLayout>('LAYOUT_1');
  const previewLinkPage = buildPreviewLinkPage({ layout, name, slug });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    create.mutate(
      {
        name,
        slug: slug || slugify(name),
        layout,
      },
      {
        onSuccess: (page) => navigate(routes.linkPages.edit(page.id)),
      },
    );
  };

  return (
    <div className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_430px]'>
      <form
        className='flex min-w-0 flex-col gap-4 rounded-md border p-5'
        onSubmit={submit}
      >
        <div className='flex items-center gap-3'>
          <BackButton
            to={routes.linkPages.list}
            label='Voltar para Páginas'
          />
          <div>
            <p className='text-muted-foreground text-sm'>Nova LinkPage</p>
            <h1 className='text-2xl font-semibold'>Criar página de cliente</h1>
          </div>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='name'>Nome interno</Label>
          <Input
            id='name'
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            required
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='slug'>Slug</Label>
          <Input
            id='slug'
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            required
          />
        </div>
        <fieldset className='grid gap-3'>
          <legend className='text-sm font-medium'>Modelo</legend>
          <div className='grid gap-3 md:grid-cols-3'>
            {layoutOptions.map((option) => (
              <button
                key={option.value}
                type='button'
                className={cn(
                  'rounded-md border p-3 text-left transition hover:border-slate-400',
                  layout === option.value &&
                    'border-slate-950 ring-2 ring-slate-950/10',
                )}
                aria-pressed={layout === option.value}
                onClick={() => setLayout(option.value)}
              >
                <LayoutMiniPreview layout={option.value} />
                <p className='mt-3 font-medium'>{option.label}</p>
                <p className='text-muted-foreground mt-1 text-xs'>
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </fieldset>
        <div className='flex justify-end gap-2'>
          <Button
            asChild
            variant='outline'
          >
            <RouterLink to={routes.linkPages.list}>Cancelar</RouterLink>
          </Button>
          <Button
            type='submit'
            disabled={create.isPending}
          >
            Criar e editar
          </Button>
        </div>
      </form>

      <aside className='rounded-md border bg-slate-100 p-4 dark:bg-slate-950'>
        <p className='mb-3 text-sm font-medium'>Prévia</p>
        <div className='h-[500px] overflow-hidden rounded-md sm:h-[530px]'>
          <div className='mx-auto w-full max-w-[390px] origin-top scale-[0.68] sm:scale-[0.72]'>
            <LinkPageRenderer
              linkPage={previewLinkPage}
              preview
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
