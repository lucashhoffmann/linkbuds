import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BillingSection } from '../components/billing-section.component';

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  useBillingOverviewUseCase: vi.fn(),
  useBillingMutations: vi.fn(),
}));

vi.mock('@/app/modules/auth/hooks', () => ({ useSession: mocks.useSession }));
vi.mock('@/app/modules/billing/use-cases/use-billing.use-case', () => ({
  useBillingOverviewUseCase: mocks.useBillingOverviewUseCase,
  useBillingMutations: mocks.useBillingMutations,
}));

const mutation = () => ({ mutate: vi.fn(), isPending: false });
const overview = (overrides: Record<string, unknown> = {}) => ({
  providerConfigured: true,
  provider: 'fake',
  plan: { code: 'FREE', name: 'Grátis' },
  entitlements: {
    planCode: 'FREE',
    maxClientPages: 1,
    maxMembers: 1,
    analyticsTier: 'BASIC',
    customDomain: true,
    whiteLabel: false,
    custom: false,
  },
  specialCondition: null,
  subscription: null,
  prices: [
    { code: 'FREE', name: 'Grátis', monthlyCents: 0, yearlyCents: 0 },
    {
      code: 'AGENCY',
      name: 'Agência',
      monthlyCents: 18000,
      yearlyCents: 162000,
    },
  ],
  balanceCents: 0,
  ledger: [],
  ...overrides,
});

function renderSection(path = '/settings') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BillingSection />
    </MemoryRouter>,
  );
}

describe('BillingSection', () => {
  let mutations: Record<string, ReturnType<typeof mutation>>;

  beforeEach(() => {
    mocks.useSession.mockReturnValue({ userAuthenticated: { role: 'OWNER' } });
    mutations = {
      redeemCoupon: mutation(),
      checkout: mutation(),
      cancel: mutation(),
      completeFakeCheckout: mutation(),
    };
    mocks.useBillingMutations.mockReturnValue(mutations);
    mocks.useBillingOverviewUseCase.mockReturnValue({ data: overview() });
  });

  it('shows limits, upgrade prices by cycle and starts a checkout', () => {
    renderSection();

    expect(screen.getByText('Plano Grátis')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s180,00 \/ mês/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Anual' }));
    expect(screen.getByText(/R\$\s1\.620,00 \/ ano/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Assinar' }));
    expect(mutations.checkout.mutate).toHaveBeenCalledWith({
      planCode: 'AGENCY',
      billingCycle: 'YEARLY',
    });
  });

  it('redeems coupons and shows the granted plan', () => {
    mocks.useBillingOverviewUseCase.mockReturnValue({
      data: overview({
        entitlements: {
          ...overview().entitlements,
          planCode: 'AGENCY',
          custom: true,
        },
        specialCondition: {
          note: 'Cupom LIBERATUDO',
          endsAt: null,
          coupon: 'LIBERATUDO',
        },
        prices: [
          { code: 'FREE', name: 'Grátis', monthlyCents: 0, yearlyCents: 0 },
          { code: 'AGENCY', name: 'Agência', monthlyCents: 0, yearlyCents: 0 },
        ],
      }),
    });
    renderSection();

    expect(screen.getByText('Plano Agência')).toBeInTheDocument();
    expect(screen.getByText('Cupom LIBERATUDO')).toBeInTheDocument();
    // Free under the coupon: nothing to buy.
    expect(
      screen.queryByRole('button', { name: 'Assinar' }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Cupom'), {
      target: { value: 'outro' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Aplicar cupom/ }));
    expect(mutations.redeemCoupon.mutate).toHaveBeenCalledWith(
      'outro',
      expect.any(Object),
    );
  });

  it('offers the fake approval only when returning from a fake checkout', () => {
    renderSection('/settings?checkout=fake&session=fake_cs_1');

    fireEvent.click(
      screen.getByRole('button', { name: 'Aprovar pagamento (teste)' }),
    );
    expect(mutations.completeFakeCheckout.mutate).toHaveBeenCalledWith(
      'fake_cs_1',
      expect.any(Object),
    );
  });

  it('is read-only for members', () => {
    mocks.useSession.mockReturnValue({ userAuthenticated: { role: 'MEMBER' } });
    renderSection();

    expect(
      screen.queryByRole('button', { name: 'Assinar' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Cupom')).not.toBeInTheDocument();
  });
});
