import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import pricingPlansService from '@/app/modules/pricing-plans/service/pricing-plans.service';
import type { PricingPlansResponse } from '@/app/modules/pricing-plans/types/pricing-plans.types';
import { routes } from '@/shared/constants/router.constants';
import { PricingPlansDialog } from '../pricing-plans-dialog/pricing-plans-dialog.component';

function LocationProbe() {
  return <span data-testid='location'>{useLocation().pathname}</span>;
}

const pricingPlansCatalog: PricingPlansResponse = {
  yearlyDiscountPercent: 25,
  plans: [
    {
      code: 'FREE',
      name: 'Gratis',
      label: 'Inicial',
      description: 'Comece a criar sua presença digital com o Linkbuds.',
      maxClientPages: 1,
      customDomain: true,
      priceCents: 0,
      priceLabel: null,
      features: ['1 pagina de cliente', 'Dominio personalizado'],
      action: 'Comecar gratis',
      featured: false,
      custom: false,
    },
    {
      code: 'AGENCY',
      name: 'Agencia',
      label: 'Padrao',
      description:
        'Gerencie paginas profissionais para seus clientes em um so lugar.',
      maxClientPages: 20,
      customDomain: true,
      priceCents: 18000,
      priceLabel: null,
      features: ['Ate 20 paginas de clientes'],
      action: 'Assinar Agencia',
      featured: true,
      custom: false,
    },
    {
      code: 'CUSTOM',
      name: 'Customizado',
      label: 'Sob medida',
      description: 'Um plano personalizado para agencias que precisam ir alem.',
      maxClientPages: null,
      customDomain: true,
      priceCents: null,
      priceLabel: 'Sob consulta',
      features: ['A partir de 21 paginas de clientes'],
      action: 'Criar meu plano',
      featured: false,
      custom: true,
    },
  ],
};

function renderPricingPlansDialog() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PricingPlansDialog trigger={<button type='button'>Planos</button>} />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PricingPlansDialog', () => {
  it('closes the dialog and goes to register when a plan is chosen', async () => {
    const user = userEvent.setup();

    renderPricingPlansDialog();
    await user.click(screen.getByRole('button', { name: 'Planos' }));
    await user.click(
      await screen.findByRole('link', { name: 'Assinar Agencia' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(routes.register);
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(pricingPlansService, 'getPricingPlans').mockResolvedValue(
      pricingPlansCatalog,
    );
    // No quote (billing off): catalog prices.
    vi.spyOn(pricingPlansService, 'getPublicQuote').mockRejectedValue(
      new Error('offline'),
    );
  });

  it('shows the charged price (card fee included) when a quote exists', async () => {
    const user = userEvent.setup();
    const quote = (billingCycle: 'MONTHLY' | 'YEARLY', totalCents: number) => ({
      planCode: 'AGENCY',
      planName: 'Agencia',
      billingCycle,
      baseCents: 0,
      feeCents: 0,
      totalCents,
      installments:
        billingCycle === 'YEARLY'
          ? [
              { count: 1, totalCents, installmentCents: totalCents },
              { count: 12, totalCents: 170036, installmentCents: 14169 },
            ]
          : [],
    });
    vi.spyOn(pricingPlansService, 'getPublicQuote').mockResolvedValue({
      method: 'CREDIT_CARD',
      quotes: [quote('MONTHLY', 18607), quote('YEARLY', 167048)],
    });

    renderPricingPlansDialog();
    await user.click(screen.getByRole('button', { name: 'Planos' }));

    expect(await screen.findByText('R$ 186,07 /mês')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Anual' }));
    expect(screen.getByText('R$ 139,21 /mês')).toBeInTheDocument();
    expect(
      screen.getByText('cobrado R$ 1.670,48/ano · ou 12x de R$ 141,69'),
    ).toBeInTheDocument();
  });

  it('toggles billing cycle and shows the custom card without a calculator', async () => {
    const user = userEvent.setup();

    renderPricingPlansDialog();

    await user.click(screen.getByRole('button', { name: 'Planos' }));

    expect(await screen.findByText('R$ 180 /mês')).toBeInTheDocument();
    expect(screen.getByText('Dominio personalizado')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Domínio próprio em todos os planos, inclusive no Grátis.',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Anual' }));

    expect(screen.getByText('R$ 135 /mês')).toBeInTheDocument();
    expect(screen.getByText('cobrado R$ 1.620/ano')).toBeInTheDocument();

    // Special conditions are not self-served: no calculator, just the card.
    expect(screen.getByText('Sob consulta')).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Paginas de clientes'),
    ).not.toBeInTheDocument();
  });
});
