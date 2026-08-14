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
  custom: {
    active: true,
    minClientPages: 21,
    consultationMinClientPages: 50,
    baseUnitPriceCents: 2000,
    stepClientPages: 5,
    stepIncrementCents: 200,
  },
  plans: [
    {
      code: 'FREE',
      type: 'FREE',
      name: 'Gratis',
      label: 'Inicial',
      description: 'Comece a criar sua presença digital com o Linkbuds.',
      maxClientPages: 1,
      priceCents: 0,
      priceLabel: null,
      features: ['1 pagina de cliente', 'Dominio personalizado'],
      action: 'Comecar gratis',
      active: true,
      featured: false,
      custom: false,
    },
    {
      code: 'AGENCY',
      type: 'AGENCY',
      name: 'Agencia',
      label: 'Padrao',
      description:
        'Gerencie paginas profissionais para seus clientes em um so lugar.',
      maxClientPages: 20,
      priceCents: 18000,
      priceLabel: null,
      features: ['Ate 20 paginas de clientes'],
      action: 'Assinar Agencia',
      active: true,
      featured: true,
      custom: false,
    },
    {
      code: 'CUSTOM',
      type: 'CUSTOM',
      name: 'Customizado',
      label: 'Sob medida',
      description:
        'Um plano personalizado para agencias que precisam ir alem.',
      maxClientPages: null,
      priceCents: null,
      priceLabel: 'Sob consulta',
      features: ['A partir de 21 paginas de clientes'],
      action: 'Criar meu plano',
      active: true,
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

  it('toggles billing cycle and calculates custom plans', async () => {
    const user = userEvent.setup();

    renderPricingPlansDialog();

    await user.click(screen.getByRole('button', { name: 'Planos' }));

    expect(await screen.findByText('R$ 180 /mês')).toBeInTheDocument();
    expect(screen.getByText('Dominio personalizado')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Anual' }));

    expect(screen.getByText('R$ 135 /mês')).toBeInTheDocument();
    expect(screen.getByText('cobrado R$ 1.620/ano')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Criar meu plano' }));

    const customPagesInput = screen.getByLabelText('Paginas de clientes');

    expect(screen.getByText('Estimativa para 21 paginas')).toBeInTheDocument();
    expect(screen.getByText('R$ 315 /mes')).toBeInTheDocument();

    await user.clear(customPagesInput);
    await user.type(customPagesInput, '26');

    expect(screen.getByText('Estimativa para 26 paginas')).toBeInTheDocument();
    expect(screen.getByText('R$ 429 /mes')).toBeInTheDocument();

    await user.clear(customPagesInput);
    await user.type(customPagesInput, '50');

    expect(
      screen.getByText('A partir de 50 paginas, o plano fica sob consulta.'),
    ).toBeInTheDocument();
  });

  it('does not render inactive plans', async () => {
    const user = userEvent.setup();

    vi.spyOn(pricingPlansService, 'getPricingPlans').mockResolvedValue({
      ...pricingPlansCatalog,
      plans: pricingPlansCatalog.plans.map((plan) =>
        plan.code === 'FREE' ? { ...plan, active: false } : plan,
      ),
    });

    renderPricingPlansDialog();

    await user.click(screen.getByRole('button', { name: 'Planos' }));

    expect(await screen.findByText('Agencia')).toBeInTheDocument();
    expect(screen.queryByText('Gratis')).not.toBeInTheDocument();
  });

  it('uses the catalog custom minimum as the initial custom page count', async () => {
    const user = userEvent.setup();

    vi.spyOn(pricingPlansService, 'getPricingPlans').mockResolvedValue({
      ...pricingPlansCatalog,
      custom: {
        ...pricingPlansCatalog.custom,
        minClientPages: 9,
      },
      plans: pricingPlansCatalog.plans.map((plan) =>
        plan.code === 'CUSTOM'
          ? {
              ...plan,
              features: ['A partir de 9 paginas de clientes'],
            }
          : plan,
      ),
    });

    renderPricingPlansDialog();

    await user.click(screen.getByRole('button', { name: 'Planos' }));
    await user.click(
      await screen.findByRole('button', { name: 'Criar meu plano' }),
    );

    expect(screen.getByLabelText('Paginas de clientes')).toHaveValue(9);
    expect(screen.getByText('Estimativa para 9 paginas')).toBeInTheDocument();
  });
});
