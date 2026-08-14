import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Action } from '@/app/modules/authorization/types/authorization.types';
import type { LinkPageDetail } from '@/app/modules/link-pages/types/link-pages.types';
import {
  LinkPageEditPage,
  reorderLinksForDrop,
} from '../link-page-edit.page';

const mocks = vi.hoisted(() => ({
  useCan: vi.fn(),
  useGetLinkPageUseCase: vi.fn(),
  useLinkPageAnalyticsInsightsUseCase: vi.fn(),
  useLinkPageLinkClicksUseCase: vi.fn(),
  useLinkPageMutations: vi.fn(),
}));

vi.mock('@/app/modules/authorization/hooks/use-ability', () => ({
  useCan: mocks.useCan,
}));

vi.mock('@/app/modules/link-pages/use-cases/use-link-pages.use-case', () => ({
  useGetLinkPageUseCase: mocks.useGetLinkPageUseCase,
  useLinkPageAnalyticsInsightsUseCase: mocks.useLinkPageAnalyticsInsightsUseCase,
  useLinkPageLinkClicksUseCase: mocks.useLinkPageLinkClicksUseCase,
  useLinkPageMutations: mocks.useLinkPageMutations,
}));

const page: LinkPageDetail = {
  id: 'page-id',
  companyId: 'company-id',
  name: 'Cliente Roma',
  slug: 'cliente-roma',
  type: 'CLIENT',
  status: 'ACTIVE',
  layout: 'LAYOUT_1',
  title: 'Cliente Roma',
  subtitle: 'Pizza artesanal',
  backgroundType: 'SOLID',
  backgroundColor: '#FFFFFF',
  backgroundImageUrl: null,
  avatarUrl: null,
  footerMode: 'LINKSBUDS',
  footerText: null,
  footerUrl: null,
  footerLogoUrl: null,
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
    reorderLinks: createMutationMock(),
    createSocialLink: createMutationMock(),
    updateSocialLink: createMutationMock(),
    deleteSocialLink: createMutationMock(),
    createImage: createMutationMock(),
    updateImage: createMutationMock(),
    deleteImage: createMutationMock(),
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
    mocks.useCan.mockReturnValue(true);
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
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
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

    fireEvent.click(screen.getByRole('button', { name: 'Appearance' }));
    fireEvent.change(screen.getByDisplayValue('Layout 1'), {
      target: { value: 'LAYOUT_2' },
    });

    await act(async () => {
      vi.advanceTimersByTime(700);
      await Promise.resolve();
    });

    expect(mutations.update.mutateAsync).toHaveBeenCalledWith({
      backgroundColor: '#FFFFFF',
      backgroundImageUrl: null,
      backgroundType: 'SOLID',
      layout: 'LAYOUT_2',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
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
    });

    fireEvent.click(screen.getByRole('button', { name: 'Branding' }));
    fireEvent.change(screen.getByDisplayValue('Powered by LinksBuds'), {
      target: { value: 'HIDDEN' },
    });

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

  it('keeps link creation working', () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.change(screen.getByPlaceholderText('Rótulo'), {
      target: { value: 'Reservar' },
    });
    fireEvent.change(screen.getByPlaceholderText('URL'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Adicionar' })[0]);

    expect(mutations.createLink.mutate).toHaveBeenCalledWith({
      active: true,
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      borderEnabled: true,
      contactType: null,
      contactValue: null,
      kind: 'LINK',
      label: 'Reservar',
      placement: 'VERTICAL',
      sortOrder: 3,
      textColor: '#111827',
      url: 'https://example.com',
    });
  });

  it('keeps the live preview as a contained sticky panel', () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    const preview = screen.getByTestId('link-page-live-preview');

    expect(preview).toHaveClass('self-start');
    expect(preview).toHaveClass('md:sticky');
    expect(preview).toHaveClass('md:top-4');
  });

  it('creates WhatsApp links with WhatsApp default colors', () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.change(screen.getByDisplayValue('Link'), {
      target: { value: 'CONTACT' },
    });
    fireEvent.change(screen.getByPlaceholderText('Rótulo'), {
      target: { value: 'WhatsApp' },
    });
    fireEvent.change(screen.getByPlaceholderText('WhatsApp com DDD'), {
      target: { value: '5511999999999' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Adicionar' })[0]);

    expect(mutations.createLink.mutate).toHaveBeenCalledWith({
      active: true,
      backgroundColor: '#25D366',
      borderColor: '#25D366',
      borderEnabled: false,
      contactType: 'WHATSAPP',
      contactValue: '5511999999999',
      kind: 'CONTACT',
      label: 'WhatsApp',
      placement: 'VERTICAL',
      sortOrder: 3,
      textColor: '#FFFFFF',
      url: null,
    });
  });

  it('updates existing link colors from the editor', () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.change(screen.getByLabelText('Fundo de A'), {
      target: { value: '#25D366' },
    });

    expect(mutations.updateLink.mutate).toHaveBeenCalledWith({
      linkId: 'link-a',
      payload: { backgroundColor: '#25D366' },
    });
  });

  it('shows lifetime click counts on editable link rows', () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    expect(mocks.useLinkPageLinkClicksUseCase).toHaveBeenCalledWith(
      'page-id',
      true,
    );
    expect(screen.getByText('7 clicks')).toBeInTheDocument();
    expect(screen.getAllByText('0 clicks')).toHaveLength(2);
  });

  it('hides link click counts when analytics is blocked', () => {
    const mutations = createMutationsMock();
    mocks.useCan.mockReturnValue(false);
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    expect(mocks.useLinkPageLinkClicksUseCase).toHaveBeenCalledWith(
      'page-id',
      false,
    );
    expect(screen.queryByText(/clicks/)).not.toBeInTheDocument();
  });

  it('keeps white-label blocked for free plans with custom domains', () => {
    const mutations = createMutationsMock();
    mocks.useCan.mockImplementation(
      (action) => action !== Action.ManageWhiteLabel,
    );
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.click(screen.getByRole('button', { name: 'Branding' }));

    expect(screen.getByText('Domínio próprio')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Configurar domínio' }),
    ).toHaveAttribute('href', '/link-pages');
    expect(screen.getByText(/White-label está disponível/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Custom Footer' })).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Hide Footer' })).toBeDisabled();
  });

  it('shows basic analytics for free plans', () => {
    const mutations = createMutationsMock();
    mocks.useLinkPageMutations.mockReturnValue(mutations);

    renderLinkPageEditPage();

    fireEvent.click(screen.getByRole('button', { name: 'Analytics' }));

    expect(screen.getByText(/plano free/i)).toBeInTheDocument();
    expect(screen.getByText('Online agora')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getAllByText(/disponível nos planos agency e custom/i).length).toBeGreaterThan(0);
  });

  it('shows full analytics dimensions for agency and custom plans', () => {
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
        limits: {
          maxRangeDays: null,
          advancedDimensionsEnabled: true,
        },
      },
      isLoading: false,
    });

    renderLinkPageEditPage();

    fireEvent.click(screen.getByRole('button', { name: 'Analytics' }));

    expect(screen.getByText(/analytics completo/i)).toBeInTheDocument();
    expect(screen.getByText('Origens')).toBeInTheDocument();
    expect(screen.getByText(/google/)).toBeInTheDocument();
    expect(screen.getByText(/mobile/)).toBeInTheDocument();
    expect(screen.getByText(/BR/)).toBeInTheDocument();
  });
});

describe('reorderLinksForDrop', () => {
  it('updates visual order and sortOrder values', () => {
    const reordered = reorderLinksForDrop(page.links, 'link-c', 'link-a');

    expect(reordered.map((link) => link.id)).toEqual([
      'link-c',
      'link-a',
      'link-b',
    ]);
    expect(reordered.map((link) => link.sortOrder)).toEqual([0, 1, 2]);
  });
});
