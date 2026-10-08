import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import billingService from '@/app/modules/billing/service/billing.service';
import pricingPlansService from '@/app/modules/pricing-plans/service/pricing-plans.service';
import type { PricingPlan } from '@/app/modules/pricing-plans/types/pricing-plans.types';
import { WelcomePlansDialog } from '../components/welcome-plans-dialog.component';

const mocks = vi.hoisted(() => ({ useSession: vi.fn() }));

vi.mock('@/app/modules/auth/hooks', () => ({ useSession: mocks.useSession }));

function plan(code: string, priceCents: number): PricingPlan {
  return {
    code,
    name: code,
    label: '',
    description: '',
    maxClientPages: 1,
    customDomain: true,
    priceCents,
    priceLabel: null,
    features: [],
    action: `Assinar ${code}`,
    featured: false,
    custom: false,
  };
}

function renderDialog(onClose = vi.fn()) {
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter>
        <WelcomePlansDialog onClose={onClose} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return onClose;
}

describe('WelcomePlansDialog', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocks.useSession.mockReturnValue({
      userAuthenticated: { name: 'Ana Souza', role: 'OWNER' },
      company: { entitlements: { planCode: 'FREE' } },
    });
    vi.spyOn(pricingPlansService, 'getPricingPlans').mockResolvedValue({
      yearlyDiscountPercent: 25,
      plans: [plan('FREE', 0), plan('AGENCY', 18000)],
    });
    vi.spyOn(pricingPlansService, 'getPublicQuote').mockRejectedValue(
      new Error('offline'),
    );
    vi.spyOn(billingService, 'quote').mockResolvedValue({
      method: 'CREDIT_CARD',
      quotes: [
        {
          planCode: 'AGENCY',
          planName: 'Agência',
          billingCycle: 'MONTHLY',
          baseCents: 18000,
          feeCents: 0,
          totalCents: 18000,
          installments: [],
        },
      ],
    });
  });

  it('greets and lets the user stay on the current plan', async () => {
    const onClose = renderDialog();

    expect(await screen.findByText('Bem-vindo, Ana!')).toBeInTheDocument();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Continuar no FREE' }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('opens the checkout of the chosen plan', async () => {
    renderDialog();

    await userEvent.click(
      await screen.findByRole('button', { name: /Assinar AGENCY/ }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Plano Agência' }),
    ).toBeInTheDocument();
  });
});
