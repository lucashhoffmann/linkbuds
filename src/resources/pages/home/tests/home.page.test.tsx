import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from '../home.page';

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  useLinkPagesOverviewUseCase: vi.fn(),
}));

vi.mock('@/app/modules/auth/hooks', () => ({ useSession: mocks.useSession }));
vi.mock('@/app/modules/link-pages/use-cases/use-link-pages.use-case', () => ({
  useLinkPagesOverviewUseCase: mocks.useLinkPagesOverviewUseCase,
  usePublicPageUrl: () => (page: { publicPath: string }) => ({
    path: `/p/${page.publicPath}`,
    url: `https://links.agencia.com/p/${page.publicPath}`,
  }),
}));

const page = (overrides: Record<string, unknown>) => ({
  companyId: 'c',
  status: 'ACTIVE',
  layout: 'LAYOUT_1',
  title: '',
  subtitle: null,
  postNetwork: null,
  postUrl: null,
  createdAt: '',
  updatedAt: '',
  parentPageId: null,
  visitors: 0,
  ...overrides,
});

describe('HomePage', () => {
  beforeEach(() => {
    mocks.useSession.mockReturnValue({
      company: {
        id: 'c',
        name: 'Agência Sol',
        entitlements: {
          planCode: 'AGENCY',
          customDomain: true,
          whiteLabel: true,
        },
      },
      userAuthenticated: { name: 'Ana Souza' },
    });
  });

  it('shows totals and ranks bios by views and posts by clicks', () => {
    mocks.useLinkPagesOverviewUseCase.mockReturnValue({
      isLoading: false,
      data: {
        tier: 'BASIC',
        range: { from: '', to: '' },
        totals: { pageViews: 1234, visitors: 800, clicks: 321 },
        pages: [
          page({
            id: 'a',
            name: 'Pizzaria',
            type: 'CLIENT',
            publicPath: 'pizzaria',
            pageViews: 900,
            clicks: 100,
          }),
          page({
            id: 'b',
            name: 'Promo terça',
            type: 'POST',
            publicPath: 'pizzaria/promo',
            pageViews: 300,
            clicks: 200,
            parentPageId: 'a',
          }),
          page({
            id: 'c',
            name: 'Sem acesso',
            type: 'CLIENT',
            publicPath: 'x',
            pageViews: 0,
            clicks: 0,
          }),
        ],
      },
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Olá, Ana')).toBeInTheDocument();
    expect(screen.getByText(/últimos 7 dias/)).toBeInTheDocument();
    expect(screen.getByText('1.234')).toBeInTheDocument();
    expect(screen.getByText('Pizzaria')).toBeInTheDocument();
    expect(screen.getByText('Promo terça')).toBeInTheDocument();
    expect(screen.queryByText('Sem acesso')).not.toBeInTheDocument();
  });

  it('guides the agency when there is no traffic yet', () => {
    mocks.useLinkPagesOverviewUseCase.mockReturnValue({
      isLoading: false,
      data: {
        tier: 'FULL',
        range: { from: '', to: '' },
        totals: { pageViews: 0, visitors: 0, clicks: 0 },
        pages: [],
      },
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Ainda sem visitas/)).toBeInTheDocument();
    expect(screen.getByText(/Crie links de post/)).toBeInTheDocument();
  });

  it('shows each total with change vs previous window and daily bars', () => {
    mocks.useLinkPagesOverviewUseCase.mockReturnValue({
      isLoading: false,
      data: {
        tier: 'BASIC',
        range: { from: '', to: '' },
        totals: { pageViews: 300, visitors: 90, clicks: 0 },
        previousTotals: { pageViews: 200, visitors: 100, clicks: 0 },
        daily: {
          pageViews: [10, 20, 30, 40, 50, 60, 90],
          visitors: [1, 2, 3, 4, 5, 6, 7],
          clicks: [0, 0, 0, 0, 0, 0, 0],
        },
        pages: [],
      },
    });

    render(<HomePage />, { wrapper: MemoryRouter });

    expect(screen.getByText('+50%')).toBeInTheDocument();
    expect(screen.getByText('-10%')).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        'Visualizações por dia: 10, 20, 30, 40, 50, 60, 90',
      ),
    ).toBeInTheDocument();
  });
});
