import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BillingHistorySection,
  upcomingEntries,
} from '../components/billing-history-section.component';

const mocks = vi.hoisted(() => ({
  useBillingOverviewUseCase: vi.fn(),
  useBillingLedgerEntryUseCase: vi.fn(),
}));

vi.mock('@/app/modules/billing/use-cases/use-billing.use-case', () => ({
  useBillingOverviewUseCase: mocks.useBillingOverviewUseCase,
  useBillingLedgerEntryUseCase: mocks.useBillingLedgerEntryUseCase,
}));

const subscription = (overrides: Record<string, unknown> = {}) => ({
  status: 'ACTIVE' as const,
  plan: { code: 'AGENCY', name: 'Agência' },
  billingCycle: 'YEARLY' as const,
  amountCents: 168784,
  installmentCount: 1,
  currentPeriodEnd: '2027-10-06T12:00:00.000Z',
  cancelAtPeriodEnd: false,
  ...overrides,
});

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

describe('upcomingEntries', () => {
  const now = new Date('2026-12-20T00:00:00.000Z');

  it('lists the installments still due and the renewal', () => {
    const entries = upcomingEntries(
      subscription({ installmentCount: 12 }),
      now,
    );
    // Installments 1-3 (Oct, Nov, Dec 6) are past; 4..12 + renewal remain.
    expect(entries).toHaveLength(10);
    expect(entries[0]).toMatchObject({
      description: 'Parcela 4/12 na fatura do cartão',
      amountCents: 14065,
    });
    expect(entries.at(-1)).toMatchObject({
      description: 'Renovação Agência · anual em 12x',
      amountCents: 168784,
    });
  });

  it('shows the downgrade instead of a renewal when canceled', () => {
    expect(
      upcomingEntries(subscription({ cancelAtPeriodEnd: true }), now),
    ).toEqual([
      {
        date: new Date('2027-10-06T12:00:00.000Z'),
        description: 'Fim do plano Agência · volta para o Grátis',
        amountCents: null,
      },
    ]);
  });

  it('is empty without a live subscription', () => {
    expect(upcomingEntries(null, now)).toEqual([]);
    expect(upcomingEntries(subscription({ status: 'CANCELED' }), now)).toEqual(
      [],
    );
  });
});

describe('BillingHistorySection', () => {
  beforeEach(() => {
    mocks.useBillingLedgerEntryUseCase.mockImplementation(
      (id: string | null) =>
        id ? { data: ledgerEntry, isLoading: false } : { isLoading: false },
    );
  });

  it('shows upcoming charges and opens the receipt of a history entry', () => {
    mocks.useBillingOverviewUseCase.mockReturnValue({
      data: {
        subscription: subscription({
          billingCycle: 'MONTHLY',
          amountCents: 18606,
        }),
        ledger: [
          {
            id: 'entry-1',
            type: 'PAYMENT',
            amountCents: 168784,
            currency: 'BRL',
            description: 'Pagamento recebido',
            createdAt: '2026-10-06T04:49:00.000Z',
          },
        ],
      },
    });
    render(<BillingHistorySection />);

    expect(screen.getByText('Renovação Agência · mensal')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Pagamento recebido/ }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Agência · anual');
    expect(dialog).toHaveTextContent(/Valor do plano\s*R\$\s1\.620,00/);
    expect(dialog).toHaveTextContent(
      /Taxa de processamento do cartão\s*R\$\s67,84/,
    );
    expect(dialog).toHaveTextContent(
      /Mastercard •••• 8829 · 12x de R\$\s140,65/,
    );
    expect(dialog).toHaveTextContent(/06\/10\/2026 às \d{2}:49/);
    expect(
      screen.getByRole('button', { name: /Baixar comprovante/ }),
    ).toBeInTheDocument();
  });

  it('says when there is nothing scheduled or recorded', () => {
    mocks.useBillingOverviewUseCase.mockReturnValue({
      data: { subscription: null, ledger: [] },
    });
    render(<BillingHistorySection />);

    expect(
      screen.getByText('Nenhuma cobrança programada.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Nenhum lançamento ainda.')).toBeInTheDocument();
  });
});
