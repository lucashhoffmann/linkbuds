import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LinkPageDetail } from '@/app/modules/link-pages/types/link-pages.types';
import {
  LinkPageEditPage,
  reorderContentForDrop,
} from '../link-page-edit.page';
import { orderContent } from '@/app/modules/link-pages/utils/content-order.util';

const mocks = vi.hoisted(() => ({
  useEntitlements: vi.fn(),
  useGetLinkPageUseCase: vi.fn(),
  useLinkPageAnalyticsInsightsUseCase: vi.fn(),
  useLinkPageLinkClicksUseCase: vi.fn(),
  useLinkPageAnalyticsGeoUseCase: vi.fn(),
  useLinkPageMutations: vi.fn(),
  useLinkPreviewUseCase: vi.fn(),
}));

vi.mock('@/app/modules/auth/hooks/use-entitlements', () => ({
  useEntitlements: mocks.useEntitlements,
}));

vi.mock('@/app/modules/link-pages/use-cases/use-link-pages.use-case', () => ({
  useGetLinkPageUseCase: mocks.useGetLinkPageUseCase,
  useLinkPageAnalyticsInsightsUseCase:
    mocks.useLinkPageAnalyticsInsightsUseCase,
  useLinkPageLinkClicksUseCase: mocks.useLinkPageLinkClicksUseCase,
  useLinkPageAnalyticsGeoUseCase: mocks.useLinkPageAnalyticsGeoUseCase,
  useLinkPageMutations: mocks.useLinkPageMutations,
  useLinkPreviewUseCase: mocks.useLinkPreviewUseCase,
}));

const page: LinkPageDetail = {
  id: 'page-id',
  companyId: 'company-id',
  name: 'Cliente Roma',
  slug: 'cliente-roma',
  type: 'CLIENT',
  publicPath: 'cliente-roma',
  parentPageId: null,
  postNetwork: null,
  postUrl: null,
  status: 'ACTIVE',
  layout: 'LAYOUT_1',
  title: 'Cliente Roma',
  subtitle: 'Pizza artesanal',
  backgroundType: 'SOLID',
  backgroundColor: '#FFFFFF',
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
      id: 'link-a',
      placement: 'VERTICAL',
      kind: 'LINK',
      label: 'A',
      url: 'https://a.example.com',
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
      id: 'link-b',
      placement: 'VERTICAL',
      kind: 'LINK',
      label: 'B',
      url: 'https://b.example.com',
      contactType: null,
      contactValue: null,
      textColor: '#111827',
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      borderEnabled: true,
      sortOrder: 1,
      active: true,
    },
    {
      id: 'link-c',
      placement: 'HORIZONTAL',
      kind: 'CONTACT',
      label: 'C',
      url: null,
      contactType: 'WHATSAPP',
      contactValue: '5511999999999',
      textColor: '#111827',
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      borderEnabled: true,
      sortOrder: 2,
      active: true,
    },
  ],
  socialLinks: [],
  images: [],
  videos: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function createMutationMock() {
  return {
    isPending: false,
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  };
}

function createMutationsMock() {
  return {
    create: createMutationMock(),
    update: createMutationMock(),
    remove: createMutationMock(),
    updateFooter: createMutationMock(),
    createLink: createMutationMock(),
    updateLink: createMutationMock(),
    deleteLink: createMutationMock(),
    reorderContent: createMutationMock(),
    createSocialLink: createMutationMock(),
    updateSocialLink: createMutationMock(),
    deleteSocialLink: createMutationMock(),
    createImage: createMutationMock(),
    updateImage: createMutationMock(),
    deleteImage: createMutationMock(),
    createVideo: createMutationMock(),
    updateVideo: createMutationMock(),
    deleteVideo: createMutationMock(),
  };
}

function renderLinkPageEditPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/link-pages/page-id/edit']}>
        <Routes>
          <Route
            path='/link-pages/:id/edit'
            element={<LinkPageEditPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LinkPageEditPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.useEntitlements.mockReturnValue({
      analytics: true,
      whiteLabel: true,
    });
    mocks.useGetLinkPageUseCase.mockReturnValue({
      data: page,
      isLoading: false,
    });
    mocks.useLinkPageAnalyticsInsightsUseCase.mockReturnValue({
      data: {
        tier: 'BASIC',
        range: {
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-01-08T00:00:00.000Z',
        },
        summary: {
          onlineNow: 2,
          pageViews: 10,
          uniqueVisitors: 8,
          totalClicks: 4,
          clickThroughRate: 0.4,
          averageDurationMs: 1200,
        },
        topTargets: [
          {
            targetId: 'link-a',
            targetType: 'VERTICAL_LINK',
            clicks: '4',
          },
        ],
        timeseries: [],
        sources: [],
        devices: [],
        countries: [],
        visitorIps: [
          {
            ip: '203.0.113.7',
            count: 3,
            lastSeenAt: '2026-01-07T12:00:00.000Z',
          },
        ],
        limits: {
          maxRangeDays: 7,
          advancedDimensionsEnabled: false,
        },
      },
      isLoading: false,
    });
    mocks.useLinkPageLinkClicksUseCase.mockReturnValue({
      data: {
        items: [{ linkId: 'link-a', clicks: 7 }],
      },
      isLoading: false,
    });
    mocks.useLinkPreviewUseCase.mockReturnValue({
      ...createMutationMock(),
      isError: false,
      isLoading: false,
      reset: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('edits a saved video: autoplay and controls can be toggled again', async () => {
    mocks.useGetLinkPageUseCase.mockReturnValue({
      data: {
        ...page,
        videos: [
          {
            id: 'video-a',
            url: 'https://youtu.be/dQw4w9WgXcQ',
            title: 'Video novo todo dia!',
            autoplay: true,
            controls: true,
            size: 'MEDIUM',
            customHeight: null,
            sortOrder: 0,
            active: true,
          },
        ],
      },
      isLoading: false,
    });
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    const videoRow = screen.getByTestId('content-row-video');
    expect(videoRow).toHaveTextContent('Vídeo · Médio · autoplay');
    fireEvent.click(within(videoRow).getByRole('button', { name: 'Editar' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(
      within(dialog).getByLabelText('Tocar automaticamente (sem som)'),
    );
    fireEvent.click(within(dialog).getByLabelText('Mostrar controles'));
    await act(async () => {
      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Salvar alterações' }),
      );
    });

    expect(mutations.updateVideo.mutateAsync).toHaveBeenCalledWith({
      videoId: 'video-a',
      payload: {
        url: 'https://youtu.be/dQw4w9WgXcQ',
        title: 'Video novo todo dia!',
        autoplay: false,
        controls: false,
        size: 'MEDIUM',
        customHeight: null,
      },
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('content-row-video')).toHaveTextContent(
      'Vídeo · Médio · sem controles',
    );
  });

  it('adds a video from its modal at the end of the shared order', async () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.click(screen.getByRole('button', { name: 'Vídeo' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('URL do vídeo'), {
      target: { value: 'https://vimeo.com/76979871' },
    });
    await act(async () => {
      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Adicionar vídeo' }),
      );
    });

    expect(mutations.createVideo.mutateAsync).toHaveBeenCalledWith({
      url: 'https://vimeo.com/76979871',
      title: null,
      autoplay: false,
      controls: true,
      size: 'MEDIUM',
      customHeight: null,
      sortOrder: 3,
      active: true,
    });
  });

  it('autosaves header fields once after debounce', async () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.change(screen.getByDisplayValue('Cliente Roma'), {
      target: { value: 'Cliente Roma Novo' },
    });

    expect(screen.getByRole('button', { name: /aguardando/i })).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(700);
      await Promise.resolve();
    });

    expect(mutations.update.mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutations.update.mutateAsync).toHaveBeenCalledWith({
      avatarUrl: null,
      subtitle: 'Pizza artesanal',
      title: 'Cliente Roma Novo',
    });
  });

  it('autosaves appearance, settings and branding with each section payload', async () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.click(screen.getByRole('radio', { name: 'Aparência' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Modelo 1' }));
    fireEvent.click(screen.getByRole('option', { name: 'Modelo 2' }));

    await act(async () => {
      vi.advanceTimersByTime(700);
      await Promise.resolve();
    });

    expect(mutations.update.mutateAsync).toHaveBeenCalledWith({
      backgroundColor: '#FFFFFF',
      backgroundImageUrl: null,
      backgroundType: 'SOLID',
      layout: 'LAYOUT_2',
      titleColor: null,
      subtitleColor: null,
      footerColor: null,
      backgroundGradientColor: '#FFFFFF',
      titleBold: true,
      subtitleBold: false,
      footerBold: false,
      footerStyle: 'TEXT',
      footerBackgroundColor: null,
      footerBorderColor: null,
    });

    fireEvent.click(screen.getByRole('radio', { name: 'Configurações' }));
    fireEvent.change(screen.getByDisplayValue('cliente-roma'), {
      target: { value: 'cliente-novo' },
    });

    await act(async () => {
      vi.advanceTimersByTime(700);
      await Promise.resolve();
    });

    expect(mutations.update.mutateAsync).toHaveBeenCalledWith({
      name: 'Cliente Roma',
      slug: 'cliente-novo',
      status: 'ACTIVE',
      gtmContainerId: null,
      ga4MeasurementId: null,
    });

    fireEvent.click(screen.getByRole('radio', { name: 'Marca' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Com LinkBuds' }));
    fireEvent.click(screen.getByRole('option', { name: 'Ocultar rodapé' }));

    await act(async () => {
      vi.advanceTimersByTime(700);
      await Promise.resolve();
    });

    expect(mutations.updateFooter.mutateAsync).toHaveBeenCalledWith({
      footerLogoUrl: null,
      footerMode: 'HIDDEN',
      footerText: null,
      footerUrl: null,
    });
  });

  it('creates links from the central modal', () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar link' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Adicionar link');
    fireEvent.change(within(dialog).getByLabelText('Rótulo'), {
      target: { value: 'Reservar' },
    });
    fireEvent.change(within(dialog).getByLabelText('URL'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Adicionar link' }),
    );

    expect(mutations.createLink.mutateAsync).toHaveBeenCalledWith({
      active: true,
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      borderEnabled: true,
      contactType: null,
      contactValue: null,
      customHeight: null,
      displaySize: 'MEDIUM',
      kind: 'LINK',
      label: 'Reservar',
      placement: 'VERTICAL',
      previewDescription: null,
      previewImageUrl: null,
      sortOrder: 3,
      textColor: '#111827',
      url: 'https://example.com',
    });
  });

  it('fills a preview link from the site and keeps it editable', async () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);
    const getPreview = vi.fn().mockResolvedValue({
      title: 'Loja Roma',
      description: 'Pizzas com 25% off',
      imageUrl: 'https://loja.example.com/og.png',
    });
    mocks.useLinkPreviewUseCase.mockReturnValue({
      ...createMutationMock(),
      mutateAsync: getPreview,
      isError: false,
      isLoading: false,
      reset: vi.fn(),
    });

    renderLinkPageEditPage();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar link' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Tipo'), {
      target: { value: 'PREVIEW' },
    });
    expect(within(dialog).getByLabelText('Posição')).toBeDisabled();
    const url = within(dialog).getByLabelText('URL');
    fireEvent.change(url, { target: { value: 'https://loja.example.com' } });
    await act(async () => {
      fireEvent.blur(url);
    });

    expect(getPreview).toHaveBeenCalledWith('https://loja.example.com');
    expect(within(dialog).getByLabelText('Título')).toHaveValue('Loja Roma');
    fireEvent.change(within(dialog).getByLabelText('Descrição'), {
      target: { value: 'Promoção da semana' },
    });
    // Blur again with the same URL must not overwrite manual edits.
    await act(async () => {
      fireEvent.blur(url);
    });
    expect(getPreview).toHaveBeenCalledTimes(1);

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Adicionar link' }),
    );

    expect(mutations.createLink.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'PREVIEW',
        label: 'Loja Roma',
        placement: 'VERTICAL',
        url: 'https://loja.example.com',
        previewDescription: 'Promoção da semana',
        previewImageUrl: 'https://loja.example.com/og.png',
      }),
    );
  });

  it('keeps the live preview as a contained sticky panel', () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    const preview = screen.getByTestId('link-page-live-preview');

    expect(preview).toHaveClass('self-start');
    expect(preview).toHaveClass('lg:sticky');
    expect(
      within(preview).getByRole('radio', { name: 'Mobile' }),
    ).toBeChecked();
    expect(preview).toHaveClass('lg:top-6');
  });

  it('creates WhatsApp links with WhatsApp default colors', () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar link' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Tipo'), {
      target: { value: 'CONTACT' },
    });
    fireEvent.change(within(dialog).getByLabelText('Rótulo'), {
      target: { value: 'WhatsApp' },
    });
    fireEvent.change(within(dialog).getByLabelText('WhatsApp com DDD'), {
      target: { value: '5511999999999' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Adicionar link' }),
    );

    expect(mutations.createLink.mutateAsync).toHaveBeenCalledWith({
      active: true,
      backgroundColor: '#25D366',
      borderColor: '#25D366',
      borderEnabled: false,
      contactType: 'WHATSAPP',
      contactValue: '5511999999999',
      customHeight: null,
      displaySize: 'MEDIUM',
      kind: 'CONTACT',
      label: 'WhatsApp',
      placement: 'VERTICAL',
      previewDescription: null,
      previewImageUrl: null,
      sortOrder: 3,
      textColor: '#FFFFFF',
      url: null,
    });
  });

  it('edits links only after confirmation and discards cancelled changes', () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0]);
    let dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText('Rótulo')).toHaveValue('A');
    expect(within(dialog).getByLabelText('URL')).toHaveValue(
      'https://a.example.com',
    );

    fireEvent.change(within(dialog).getByLabelText('Rótulo'), {
      target: { value: 'A cancelado' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    expect(mutations.updateLink.mutateAsync).not.toHaveBeenCalled();
    expect(screen.getAllByText('A')).not.toHaveLength(0);

    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0]);
    dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByLabelText('Cor do fundo'));
    fireEvent.change(screen.getByLabelText('Valor hexadecimal'), {
      target: { value: '#25d366' },
    });
    expect(mutations.updateLink.mutateAsync).not.toHaveBeenCalled();
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Salvar alterações' }),
    );

    expect(mutations.updateLink.mutateAsync).toHaveBeenCalledWith({
      linkId: 'link-a',
      payload: {
        backgroundColor: '#25D366',
        borderColor: '#E5E7EB',
        borderEnabled: true,
        contactType: null,
        contactValue: null,
        customHeight: null,
        displaySize: 'MEDIUM',
        kind: 'LINK',
        label: 'A',
        placement: 'VERTICAL',
        previewDescription: null,
        previewImageUrl: null,
        textColor: '#111827',
        url: 'https://a.example.com',
      },
    });
  });

  it('keeps the edit modal open when saving fails', async () => {
    const mutations = createMutationsMock();
    mutations.updateLink.mutateAsync.mockRejectedValueOnce(
      new Error('Falha ao salvar'),
    );
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Rótulo'), {
      target: { value: 'A não salvo' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Salvar alterações' }),
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      within(screen.getByRole('dialog')).getByLabelText('Rótulo'),
    ).toHaveValue('A não salvo');
    expect(screen.getAllByText('A')).not.toHaveLength(0);
  });

  it('shows click counts on editable link rows', () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    expect(mocks.useLinkPageLinkClicksUseCase).toHaveBeenCalledWith('page-id');
    expect(screen.getByText('7 cliques')).toBeInTheDocument();
    expect(screen.getAllByText('0 cliques')).toHaveLength(2);
  });

  it('archives a link and lists it separately with restore', async () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'Arquivar' })[0]);
    });

    expect(mutations.updateLink.mutateAsync).toHaveBeenCalledWith({
      linkId: 'link-a',
      payload: { active: false },
    });
    expect(screen.getByText(/Arquivados \(1\)/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Restaurar' }),
    ).toBeInTheDocument();
  });

  it('keeps white-label blocked for free plans with custom domains', () => {
    const mutations = createMutationsMock();
    mocks.useEntitlements.mockReturnValue({
      analytics: true,
      whiteLabel: false,
    });
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.click(screen.getByRole('radio', { name: 'Marca' }));

    expect(screen.getByText('Domínio próprio')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Configurar domínio' }),
    ).toHaveAttribute('href', '/settings/domain');
    expect(
      screen.getByText(/Marca branca está disponível/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Com LinkBuds' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('combobox', { name: 'Com LinkBuds' }));

    expect(
      screen.getByRole('option', { name: 'Rodapé personalizado' }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByRole('option', { name: 'Ocultar rodapé' }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows basic analytics for free plans', () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.click(screen.getByRole('radio', { name: 'Análises' }));

    expect(screen.getByText(/plano grátis/i)).toBeInTheDocument();
    expect(screen.getByText('Online agora')).toBeInTheDocument();
    expect(screen.getByText('203.0.113.7')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Expandir países no globo' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(
      screen.getAllByText(/disponível nos planos agência e personalizado/i)
        .length,
    ).toBeGreaterThan(0);
  });

  it('shows full analytics dimensions for agency and custom plans', async () => {
    // Lazy globe dialog + findBy need real timers.
    vi.useRealTimers();
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);
    mocks.useLinkPageAnalyticsInsightsUseCase.mockReturnValue({
      data: {
        tier: 'FULL',
        range: {
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-01-31T23:59:59.999Z',
        },
        summary: {
          onlineNow: 5,
          pageViews: 100,
          uniqueVisitors: 70,
          totalClicks: 50,
          clickThroughRate: 0.5,
          averageDurationMs: 3400,
        },
        topTargets: [
          {
            targetId: 'link-b',
            targetType: 'VERTICAL_LINK',
            clicks: '20',
          },
        ],
        timeseries: [{ date: '2026-01-01T00:00:00.000Z', count: '10' }],
        sources: [{ label: 'google', count: '30' }],
        devices: [{ label: 'mobile', count: '60' }],
        countries: [{ label: 'BR', count: '80' }],
        visitorIps: [],
        limits: {
          maxRangeDays: null,
          advancedDimensionsEnabled: true,
        },
      },
      isLoading: false,
    });

    renderLinkPageEditPage();

    fireEvent.click(screen.getByRole('radio', { name: 'Análises' }));

    expect(screen.getByText(/análises completas/i)).toBeInTheDocument();
    expect(screen.getByText('Origens')).toBeInTheDocument();
    expect(screen.getByText(/google/)).toBeInTheDocument();
    expect(screen.getByText(/mobile/)).toBeInTheDocument();
    expect(screen.getByText(/BR/)).toBeInTheDocument();

    mocks.useLinkPageAnalyticsGeoUseCase.mockReturnValue({
      data: {
        realtime: false,
        total: 1,
        locations: [
          {
            countryCode: 'BR',
            count: 1,
            visits: [
              {
                createdAt: '2026-01-02T10:00:00.000Z',
                ipAddress: '198.51.100.9',
                deviceType: 'mobile',
                browser: 'Chrome',
                operatingSystem: 'Android',
                source: 'instagram',
              },
            ],
          },
        ],
      },
      isLoading: false,
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Expandir países no globo' }),
    );

    expect(
      await screen.findByRole('radio', { name: 'Tempo real' }),
    ).toBeInTheDocument();
    // Starts zoomed into the top country; user can zoom out to the world.
    const zoomOut = screen.getByRole('button', { name: /ver mundo todo/i });
    const zoomLayer = document.querySelector<SVGGElement>('svg > g');
    expect(zoomLayer?.style.transform).toContain('scale(4)');
    fireEvent.click(zoomOut);
    expect(zoomLayer?.style.transform).toContain('scale(1)');
    fireEvent.click(screen.getByRole('button', { name: /zoom em brasil/i }));
    expect(zoomLayer?.style.transform).toContain('scale(4)');
    fireEvent.click(screen.getByRole('button', { name: 'Brasil: 1 visita' }));
    expect(await screen.findByText('198.51.100.9')).toBeInTheDocument();
  });
});

describe('reorderContentForDrop', () => {
  it('moves a video above links and renumbers the shared order', () => {
    const items = orderContent(
      page.links,
      [],
      [
        {
          id: 'video-a',
          url: 'https://youtu.be/dQw4w9WgXcQ',
          title: null,
          autoplay: false,
          controls: true,
          size: 'MEDIUM',
          customHeight: null,
          sortOrder: 3,
          active: true,
        },
      ],
    );
    const reordered = reorderContentForDrop(
      items,
      'VIDEO:video-a',
      'LINK:link-a',
    );

    expect(reordered.map((entry) => entry.item.id)).toEqual([
      'video-a',
      'link-a',
      'link-b',
      'link-c',
    ]);
    expect(reordered.map((entry) => entry.item.sortOrder)).toEqual([
      0, 1, 2, 3,
    ]);
  });
});
