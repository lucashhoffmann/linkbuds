import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, X } from 'lucide-react';
import { BackButton } from '@/resources/components/base/back-button/back-button.component';
import { useEntitlements } from '@/app/modules/auth/hooks/use-entitlements';
import {
  useGetLinkPageUseCase,
  useLinkPageLinkClicksUseCase,
  useLinkPageMutations,
  usePublicPageUrl,
} from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import type { LinkPageDetail } from '@/app/modules/link-pages/types/link-pages.types';
import { Button } from '@/resources/components/ui/button';
import { routes } from '@/shared/constants/router.constants';
import {
  DevicePreview,
  SegmentedControl,
} from '@/resources/components/base/device-preview/device-preview.component';
import { LinkPageRenderer } from './renderer/link-page-renderer.component';
import type { Tab, LinkClickCountMap } from './components/editor/editor.types';
import { tabs } from './components/editor/editor.utils';
import { IntegrationsPanel } from './components/integrations-panel.component';
import { useAutosaveSection } from './components/editor/use-autosave-section';
import { ContentTab } from './components/editor/content-tab.component';
import { AppearanceTab } from './components/editor/appearance-tab.component';
import { SettingsTab } from './components/editor/settings-tab.component';
import { AnalyticsTab } from './components/editor/analytics-tab.component';
import { BrandingTab } from './components/editor/branding-tab.component';
import {
  cleanFormConfig,
  FormTab,
} from './components/editor/form-tab.component';

// Kept for existing tests/importers.
export { reorderContentForDrop } from './components/editor/editor.utils';

export function LinkPageEditPage() {
  const { id } = useParams();
  const { data, isLoading } = useGetLinkPageUseCase(id);
  // Lives here so the editor remount (key below changes when links/social/images/videos/texts are added or removed) keeps the active tab.
  // Unset = page default: forms open on their fields.
  const [tab, setTab] = useState<Tab>();

  if (isLoading) {
    return <p className='text-muted-foreground p-6 text-sm'>Carregando...</p>;
  }

  if (!data) {
    return (
      <p className='text-muted-foreground p-6 text-sm'>
        Página não encontrada.
      </p>
    );
  }

  return (
    <LinkPageEditor
      key={`${data.id}-${data.links.length}-${data.socialLinks.length}-${data.images.length}-${data.videos?.length ?? 0}-${data.texts?.length ?? 0}`}
      linkPage={data}
      tab={tab ?? (data.type === 'FORM' ? 'form' : 'content')}
      setTab={setTab}
    />
  );
}

function LinkPageEditor({
  linkPage,
  tab,
  setTab,
}: {
  linkPage: LinkPageDetail;
  tab: Tab;
  setTab: (tab: Tab) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [draft, setDraft] = useState<LinkPageDetail>(linkPage);
  const mutations = useLinkPageMutations(linkPage.id);
  const { whiteLabel: canManageWhiteLabel } = useEntitlements();
  const linkClicks = useLinkPageLinkClicksUseCase(draft.id);
  const publicPath = usePublicPageUrl()(draft).path;
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
      titleColor: draft.titleColor ?? null,
      subtitleColor: draft.subtitleColor ?? null,
      backgroundGradientColor: draft.backgroundGradientColor ?? '#FFFFFF',
      titleBold: draft.titleBold ?? true,
      subtitleBold: draft.subtitleBold ?? false,
    },
    (payload) => mutations.update.mutateAsync(payload),
  );
  const settingsStatus = useAutosaveSection(
    {
      name: draft.name,
      slug: draft.slug,
      status: draft.status,
      // Tracking ids and the Sheets URL save from the Integrações tab.
      ...(draft.type === 'POST'
        ? { postNetwork: draft.postNetwork, postUrl: draft.postUrl }
        : {}),
    },
    (payload) => mutations.update.mutateAsync(payload),
  );
  const formStatus = useAutosaveSection(
    { form: draft.form ? cleanFormConfig(draft.form) : null },
    (payload) => mutations.update.mutateAsync(payload),
    draft.type === 'FORM',
  );
  const brandingStatus = useAutosaveSection(
    {
      footerMode: draft.footerMode,
      footerText: draft.footerText,
      footerUrl: draft.footerUrl,
      footerLogoUrl: draft.footerLogoUrl,
      footerColor: draft.footerColor ?? null,
      footerBold: draft.footerBold ?? false,
      footerStyle: draft.footerStyle ?? 'TEXT',
      footerBackgroundColor: draft.footerBackgroundColor ?? null,
      footerBorderColor: draft.footerBorderColor ?? null,
      footerFontSize: draft.footerFontSize ?? 'SMALL',
      footerLogoSize: draft.footerLogoSize ?? 'SMALL',
    },
    (payload) => mutations.updateFooter.mutateAsync(payload),
  );

  const preview = (
    <DevicePreview>
      <LinkPageRenderer
        linkPage={draft}
        preview
      />
    </DevicePreview>
  );

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4 p-4 lg:p-6'>
      <header className='flex items-center gap-3'>
        <BackButton
          to={`${routes.linkPages.list}?p=${draft.id}`}
          label='Voltar para Páginas'
        />
        <div className='min-w-0 flex-1'>
          <h1 className='truncate font-semibold'>{draft.name}</h1>
          <p className='text-muted-foreground truncate text-xs'>{publicPath}</p>
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='lg:hidden'
          onClick={() => setShowPreview(true)}
        >
          <Eye className='size-4' />
          Ver prévia
        </Button>
      </header>

      <div className='grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,44%)]'>
        <section className='bg-card min-w-0 rounded-2xl border'>
          <div className='border-b p-2'>
            <SegmentedControl
              wrap
              label='Seção do editor'
              value={tab}
              onChange={setTab}
              options={(draft.type === 'FORM'
                ? [{ id: 'form' as const, label: 'Formulário' }, ...tabs]
                : tabs
              ).map((item) => ({
                value: item.id,
                label: item.label,
              }))}
            />
          </div>
          <div className='p-4'>
            {tab === 'form' && (
              <FormTab
                draft={draft}
                setDraft={setDraft}
                status={formStatus}
              />
            )}
            {tab === 'content' && (
              <ContentTab
                draft={draft}
                setDraft={setDraft}
                mutations={mutations}
                headerStatus={headerStatus}
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
            {tab === 'integrations' && (
              <IntegrationsPanel linkPage={linkPage} />
            )}
            {tab === 'analytics' && <AnalyticsTab linkPage={draft} />}
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
          className='hidden self-start lg:sticky lg:top-6 lg:block'
        >
          {preview}
        </aside>
      </div>

      {showPreview && (
        <div
          role='dialog'
          aria-modal='true'
          aria-label='Prévia'
          className='bg-background fixed inset-0 z-50 flex flex-col gap-3 overflow-y-auto p-4 lg:hidden'
        >
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='self-end'
            onClick={() => setShowPreview(false)}
          >
            <X className='size-4' />
            Fechar prévia
          </Button>
          {preview}
        </div>
      )}
    </div>
  );
}
