import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import pricingPlansService from '@/app/modules/pricing-plans/service/pricing-plans.service';
import type { PricingPlansResponse } from '@/app/modules/pricing-plans/types/pricing-plans.types';
import { PricingPlansDialog } from '../pricing-plans-dialog/pricing-plans-dialog.component';

const pricingPlansCatalog: PricingPlansResponse = {
  yearlyDiscountPercent: 25,
  plans: [
    {
      code: 'FREE',
      name: 'Gratis',
      label: 'Inicial',
      description: 'Comece a criar sua presença digital com o Linkbuds.',
      maxClientPages: 1,
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
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PricingPlansDialog', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(pricingPlansService, 'getPricingPlans').mockResolvedValue(
      pricingPlansCatalog,
    );
  });

  it('toggles billing cycle and shows the custom card without a calculator', async () => {
    const user = userEvent.setup();

    renderPricingPlansDialog();

    await user.click(screen.getByRole('button', { name: 'Planos' }));

    expect(await screen.findByText('R$ 180 /mês')).toBeInTheDocument();
    expect(screen.getByText('Dominio personalizado')).toBeInTheDocument();

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
