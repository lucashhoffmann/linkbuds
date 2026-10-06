import { useState } from 'react';
import { useGetPricingPlansUseCase } from '@/app/modules/pricing-plans/use-cases/use-get-pricing-plans.use-case';
import type {
  BillingCycle,
  PricingPlan,
} from '@/app/modules/pricing-plans/types/pricing-plans.types';

function formatCurrencyFromCents(valueCents: number) {
  const hasCents = valueCents % 100 !== 0;

  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    maximumFractionDigits: hasCents ? 2 : 0,
    minimumFractionDigits: hasCents ? 2 : 0,
    style: 'currency',
  }).format(valueCents / 100);
}

function applyYearlyDiscount(
  valueCents: number,
  yearlyDiscountPercent: number,
) {
  return Math.round(valueCents * ((100 - yearlyDiscountPercent) / 100));
}

function getMonthlyPriceForBillingCycle(
  priceCents: number,
  billingCycle: BillingCycle,
  yearlyDiscountPercent: number,
) {
  if (billingCycle === 'monthly') {
    return priceCents;
  }

  return applyYearlyDiscount(priceCents, yearlyDiscountPercent);
}

export function usePricingPlansDialogComponent() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const {
    errorPricingPlans,
    isLoadingPricingPlans,
    pricingPlansCatalog,
    publicQuote,
    refetchPricingPlans,
  } = useGetPricingPlansUseCase();

  /** Charged total (card fee included) for the plan in the selected cycle. */
  function quotedCents(plan: PricingPlan) {
    const cycle = billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY';

    return publicQuote?.quotes.find(
      (quote) => quote.planCode === plan.code && quote.billingCycle === cycle,
    )?.totalCents;
  }

  const yearlyDiscountPercent = pricingPlansCatalog?.yearlyDiscountPercent ?? 0;
  const pricingPlans = pricingPlansCatalog?.plans ?? [];

  function formatPlanMonthlyPrice(plan: PricingPlan) {
    if (plan.priceCents === null) {
      return plan.priceLabel;
    }

    const quoted = quotedCents(plan);
    if (quoted !== undefined) {
      return `${formatCurrencyFromCents(
        billingCycle === 'yearly' ? Math.round(quoted / 12) : quoted,
      )} /mês`;
    }

    return `${formatCurrencyFromCents(
      getMonthlyPriceForBillingCycle(
        plan.priceCents,
        billingCycle,
        yearlyDiscountPercent,
      ),
    )} /mês`;
  }

  /** "ou 12x de R$ X" for yearly, from the quote (card fee included). */
  function formatPlanInstallments(plan: PricingPlan) {
    if (billingCycle !== 'yearly') return null;

    const longest = publicQuote?.quotes
      .find(
        (quote) =>
          quote.planCode === plan.code && quote.billingCycle === 'YEARLY',
      )
      ?.installments.at(-1);

    return longest && longest.count > 1
      ? `ou ${longest.count}x de ${formatCurrencyFromCents(longest.installmentCents)}`
      : null;
  }

  function formatPlanYearlyTotal(plan: PricingPlan) {
    if (plan.priceCents === null) {
      return null;
    }

    const quoted = quotedCents(plan);
    if (quoted !== undefined) {
      return formatCurrencyFromCents(quoted);
    }

    return formatCurrencyFromCents(
      getMonthlyPriceForBillingCycle(
        plan.priceCents,
        billingCycle,
        yearlyDiscountPercent,
      ) * 12,
    );
  }

  return {
    billingCycle,
    errorPricingPlans,
    formatPlanInstallments,
    formatPlanMonthlyPrice,
    formatPlanYearlyTotal,
    isLoadingPricingPlans,
    pricingPlans,
    refetchPricingPlans,
    setBillingCycle,
    yearlyDiscountPercent,
  };
}
