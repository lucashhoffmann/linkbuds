import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LinkPagesPage } from '../link-pages.page';

const mocks = vi.hoisted(() => ({
  useCan: vi.fn(),
  useCompanyDomainUseCase: vi.fn(),
  useLinkPageMutations: vi.fn(),
  useListLinkPagesUseCase: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock('@/app/modules/auth/hooks', () => ({
  useSession: mocks.useSession,
}));

vi.mock('@/app/modules/authorization/hooks/use-ability', () => ({
  useCan: mocks.useCan,
}));

vi.mock('@/app/modules/link-pages/use-cases/use-link-pages.use-case', () => ({
  useCompanyDomainUseCase: mocks.useCompanyDomainUseCase,
  useLinkPageMutations: mocks.useLinkPageMutations,
  useListLinkPagesUseCase: mocks.useListLinkPagesUseCase,
}));

describe('LinkPagesPage', () => {
  beforeEach(() => {
    mocks.useCan.mockReturnValue(false);
    mocks.useSession.mockReturnValue({
      company: {
        id: 'company-id',
        plan: {
          type: 'FREE',
          customDomainEnabled: false,
          whiteLabelEnabled: false,
        },
      },
    });
    mocks.useListLinkPagesUseCase.mockReturnValue({
      data: {
        items: [],
        usage: {
          maxClientPages: 1,
          remainingClientPages: 1,
          usedClientPages: 0,
        },
      },
      isLoading: false,
    });
    mocks.useLinkPageMutations.mockReturnValue({
      remove: {
        mutate: vi.fn(),
      },
    });
    mocks.useCompanyDomainUseCase.mockReturnValue({
      create: {
        mutate: vi.fn(),
      },
      data: null,
      remove: {
        mutate: vi.fn(),
      },
      verify: {
        mutate: vi.fn(),
      },
    });
  });

  it('shows the custom domain panel for free plans even with a stale feature flag', () => {
    render(
      <MemoryRouter>
        <LinkPagesPage />
      </MemoryRouter>,
    );

    expect(mocks.useCompanyDomainUseCase).toHaveBeenCalledWith(true);
    expect(screen.getByLabelText('Domínio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('www.suaagencia.com')).toBeInTheDocument();
    expect(
      screen.queryByText(/Recurso disponível em planos com domínio customizado/i),
    ).not.toBeInTheDocument();
  });

  it('shows clear DNS pointing instructions for an existing domain', () => {
    mocks.useCompanyDomainUseCase.mockReturnValue({
      create: {
        mutate: vi.fn(),
      },
      data: {
        id: 'domain-id',
        hostname: 'www.example.com',
        status: 'PENDING',
        verificationToken: 'linksbuds-token',
        verifiedAt: null,
        lastCheckedAt: null,
        dnsInstructions: {
          type: 'CNAME',
          name: 'www.example.com',
          value: 'linksbuds.com',
          verificationToken: 'linksbuds-token',
        },
      },
      remove: {
        mutate: vi.fn(),
      },
      verify: {
        mutate: vi.fn(),
      },
    });

    render(
      <MemoryRouter>
        <LinkPagesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Apontamento DNS')).toBeInTheDocument();
    expect(screen.getByText('Tipo')).toBeInTheDocument();
    expect(screen.getByText('Host / Nome')).toBeInTheDocument();
    expect(screen.getByText('Destino / Valor')).toBeInTheDocument();
    expect(screen.getByText('CNAME')).toBeInTheDocument();
    expect(screen.getByText('www.example.com')).toBeInTheDocument();
    expect(screen.getByText('www')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Se o provedor pedir o domínio completo, use www.example.com.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('linksbuds.com')).toBeInTheDocument();
  });
});
