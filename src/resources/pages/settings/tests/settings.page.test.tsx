import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPage } from '../settings.page';

const mocks = vi.hoisted(() => ({
  useEntitlements: vi.fn(),
  useCompanyDomainUseCase: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock('../components/billing-section.component', () => ({
  BillingSection: () => <div>billing-section</div>,
}));

vi.mock('@/app/modules/auth/hooks', () => ({
  useSession: mocks.useSession,
}));

vi.mock('@/app/modules/auth/hooks/use-entitlements', () => ({
  useEntitlements: mocks.useEntitlements,
}));

vi.mock('@/app/modules/link-pages/use-cases/use-link-pages.use-case', () => ({
  useCompanyDomainUseCase: mocks.useCompanyDomainUseCase,
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    mocks.useSession.mockReturnValue({
      company: { name: 'Agência X', plan: { code: 'FREE', name: 'Grátis' } },
    });
    mocks.useEntitlements.mockReturnValue({
      customDomain: true,
      maxClientPages: 1,
      maxMembers: 1,
      analyticsTier: 'BASIC',
      whiteLabel: false,
      custom: false,
    });
    mocks.useCompanyDomainUseCase.mockReturnValue({
      create: { mutate: vi.fn() },
      data: null,
      remove: { mutate: vi.fn() },
      verify: { mutate: vi.fn() },
    });
  });

  it('renders the billing section', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('billing-section')).toBeInTheDocument();
  });

  it('shows the custom domain panel when the plan includes it', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    expect(mocks.useCompanyDomainUseCase).toHaveBeenCalledWith(true);
    expect(screen.getByLabelText('Domínio')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('www.suaagencia.com'),
    ).toBeInTheDocument();
  });

  it('shows both DNS records and a readable status for an existing domain', () => {
    mocks.useCompanyDomainUseCase.mockReturnValue({
      create: { mutate: vi.fn() },
      data: {
        id: 'domain-id',
        hostname: 'www.agencia.com.br',
        status: 'VERIFIED',
        verificationToken: 'linkbuds-token',
        verifiedAt: null,
        lastCheckedAt: null,
        dnsRecords: [
          {
            purpose: 'OWNERSHIP',
            type: 'TXT',
            name: '_linkbuds.www.agencia.com.br',
            value: 'linkbuds-token',
          },
          {
            purpose: 'ROUTING',
            type: 'CNAME',
            name: 'www.agencia.com.br',
            value: 'linkbuds.com',
          },
        ],
      },
      remove: { mutate: vi.fn() },
      verify: { mutate: vi.fn(), isPending: false },
    });

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Posse confirmada')).toBeInTheDocument();
    expect(screen.getByText('TXT')).toBeInTheDocument();
    expect(
      screen.getByText('_linkbuds.www.agencia.com.br'),
    ).toBeInTheDocument();
    expect(screen.getByText('linkbuds-token')).toBeInTheDocument();
    expect(screen.getByText('CNAME')).toBeInTheDocument();
    expect(screen.getAllByText('www.agencia.com.br').length).toBeGreaterThan(0);
    expect(screen.getByText('linkbuds.com')).toBeInTheDocument();
  });

  it('does not load the custom domain when the plan lacks it', () => {
    mocks.useEntitlements.mockReturnValue({
      customDomain: false,
      maxClientPages: 1,
      maxMembers: 1,
      analyticsTier: 'BASIC',
      whiteLabel: false,
      custom: false,
    });

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    expect(mocks.useCompanyDomainUseCase).toHaveBeenCalledWith(false);
    expect(
      screen.queryByPlaceholderText('www.suaagencia.com'),
    ).not.toBeInTheDocument();
  });
});
