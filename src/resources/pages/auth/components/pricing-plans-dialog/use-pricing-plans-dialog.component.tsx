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
    refetchPricingPlans,
  } = useGetPricingPlansUseCase();

  const yearlyDiscountPercent = pricingPlansCatalog?.yearlyDiscountPercent ?? 0;
  const pricingPlans = pricingPlansCatalog?.plans ?? [];

  function formatPlanMonthlyPrice(plan: PricingPlan) {
    if (plan.priceCents === null) {
      return plan.priceLabel;
    }

    return `${formatCurrencyFromCents(
      getMonthlyPriceForBillingCycle(
        plan.priceCents,
        billingCycle,
        yearlyDiscountPercent,
      ),
    )} /mês`;
  }

  function formatPlanYearlyTotal(plan: PricingPlan) {
    if (plan.priceCents === null) {
      return null;
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
    formatPlanMonthlyPrice,
    formatPlanYearlyTotal,
    isLoadingPricingPlans,
    pricingPlans,
    refetchPricingPlans,
    setBillingCycle,
    yearlyDiscountPercent,
  };
}
