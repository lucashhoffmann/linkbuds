import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BillingSection } from '../components/billing-section.component';

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  useBillingOverviewUseCase: vi.fn(),
  useBillingMutations: vi.fn(),
  useBillingQuoteUseCase: vi.fn(),
  useBillingLedgerEntryUseCase: vi.fn(),
}));

vi.mock('@/app/modules/auth/hooks', () => ({ useSession: mocks.useSession }));
vi.mock('@/app/modules/billing/use-cases/use-billing.use-case', () => ({
  useBillingOverviewUseCase: mocks.useBillingOverviewUseCase,
  useBillingMutations: mocks.useBillingMutations,
  useBillingQuoteUseCase: mocks.useBillingQuoteUseCase,
  useBillingLedgerEntryUseCase: mocks.useBillingLedgerEntryUseCase,
}));
vi.mock(
  '@/app/modules/pricing-plans/use-cases/use-get-pricing-plans.use-case',
  () => ({
    useGetPricingPlansUseCase: () => ({
      pricingPlansCatalog: {
        yearlyDiscountPercent: 25,
        plans: [
          {
            code: 'AGENCY',
            label: 'Mais escolhido',
            description: 'Para agências',
            features: ['Até 10 clientes', 'Analytics completo'],
            featured: true,
          },
        ],
      },
    }),
  }),
);

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

const agency = (
  billingCycle: 'MONTHLY' | 'YEARLY',
  base: number,
  total: number,
) => ({
  planCode: 'AGENCY',
  planName: 'Agência',
  billingCycle,
  baseCents: base,
  feeCents: total - base,
  totalCents: total,
  installments:
    billingCycle === 'YEARLY'
      ? [
          { count: 1, totalCents: total, installmentCents: total },
          { count: 12, totalCents: 170036, installmentCents: 14169 },
        ]
      : [],
});
const quotes = [
  agency('MONTHLY', 18000, 18607),
  agency('YEARLY', 162000, 167048),
];

const ledgerEntry = {
  id: 'entry-1',
  type: 'PAYMENT',
  description: 'Pagamento recebido',
  amountCents: 168784,
  currency: 'BRL',
  createdAt: '2026-10-06T04:49:00.000Z',
  plan: { code: 'AGENCY', name: 'Agência' },
  billingCycle: 'YEARLY',
  installments: { count: 12, amountCents: 14065 },
  breakdown: { planCents: 162000, feeCents: 6784 },
  transactionId: 'pay_e83qnlflszc8ddem',
  payment: {
    status: 'PAID',
    card: { brand: 'Mastercard', last4: '8829' },
  },
};

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
    mocks.useSession.mockReturnValue({
      userAuthenticated: { role: 'OWNER', email: 'dono@agencia.com' },
    });
    mutations = {
      redeemCoupon: mutation(),
      subscribe: mutation(),
      cancel: mutation(),
    };
    mocks.useBillingMutations.mockReturnValue(mutations);
    mocks.useBillingOverviewUseCase.mockReturnValue({ data: overview() });
    mocks.useBillingQuoteUseCase.mockReturnValue({
      data: { method: 'CREDIT_CARD', quotes },
      refetch: vi.fn(),
    });
    mocks.useBillingLedgerEntryUseCase.mockImplementation(
      (id: string | null) =>
        id ? { data: ledgerEntry, isLoading: false } : { isLoading: false },
    );
  });

  it('shows prices with fees by cycle and opens the payment form', () => {
    renderSection();

    expect(screen.getByText('Plano Grátis')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s186,07/)).toBeInTheDocument();
    expect(screen.getByText('Analytics completo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /^Anual/ }));
    expect(screen.getByText(/R\$\s1\.670,48$/)).toBeInTheDocument();
    expect(screen.getByText(/ou até 12x no cartão/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Assinar/ }));
    expect(
      screen.getByRole('button', { name: /Pagar R\$\s1\.670,48/ }),
    ).toBeInTheDocument();
  });

  it('sends only digits and the quoted total; refuses invalid fields', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Assinar/ }));
    const pay = screen.getByRole('button', { name: /Pagar/ });

    fireEvent.click(pay);
    expect(screen.getByText('Número inválido')).toBeInTheDocument();
    expect(mutations.subscribe.mutate).not.toHaveBeenCalled();

    const type = (label: string, value: string) =>
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    type('Número do cartão', '5162306219378829');
    type('Nome do titular', 'Maria Silva');
    type('Validade', '0530');
    type('CVV', '318');
    type('CPF ou CNPJ', '24971563792');
    type('Celular', '11987654321');
    type('CEP', '01310100');
    type('Número', '1000');
    expect(screen.getByLabelText('Número do cartão')).toHaveValue(
      '5162 3062 1937 8829',
    );
    fireEvent.click(pay);

    expect(mutations.subscribe.mutate).toHaveBeenCalledWith(
      {
        idempotencyKey: expect.any(String),
        input: {
          planCode: 'AGENCY',
          billingCycle: 'MONTHLY',
          expectedTotalCents: 18607,
          installmentCount: 1,
          holder: {
            name: 'Maria Silva',
            email: 'dono@agencia.com',
            cpfCnpj: '24971563792',
            phone: '11987654321',
            postalCode: '01310100',
            addressNumber: '1000',
          },
          card: {
            holderName: 'Maria Silva',
            number: '5162306219378829',
            expiryMonth: '05',
            expiryYear: '2030',
            ccv: '318',
          },
        },
      },
      expect.any(Object),
    );
  });

  it('yearly: paying in installments sends the split total and count', () => {
    renderSection();
    fireEvent.click(screen.getByRole('radio', { name: /^Anual/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Assinar/ }));

    fireEvent.click(screen.getByRole('combobox', { name: 'Parcelas' }));
    fireEvent.click(screen.getByRole('option', { name: /^12x/ }));
    expect(
      screen.getByRole('button', { name: /Pagar 12x de R\$\s141,69/ }),
    ).toBeInTheDocument();
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
    mocks.useBillingQuoteUseCase.mockReturnValue({
      data: { method: 'CREDIT_CARD', quotes: [] },
      refetch: vi.fn(),
    });
    renderSection();

    expect(screen.getByText('Plano Agência')).toBeInTheDocument();
    expect(screen.getByText('Cupom LIBERATUDO')).toBeInTheDocument();
    // Free under the coupon: nothing to buy.
    expect(
      screen.queryByRole('button', { name: /^Assinar/ }),
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

  it('is read-only for members', () => {
    mocks.useSession.mockReturnValue({ userAuthenticated: { role: 'MEMBER' } });
    renderSection();

    expect(
      screen.queryByRole('button', { name: /^Assinar/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Cupom')).not.toBeInTheDocument();
  });
});
