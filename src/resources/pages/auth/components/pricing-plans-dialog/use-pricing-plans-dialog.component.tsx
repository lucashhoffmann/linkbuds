import { useMemo, useState } from 'react';
import { useGetPricingPlansUseCase } from '@/app/modules/pricing-plans/use-cases/use-get-pricing-plans.use-case';
import type {
  BillingCycle,
  CustomPricingRules,
  PricingPlan,
} from '@/app/modules/pricing-plans/types/pricing-plans.types';

type CustomEstimate =
  | {
      status: 'invalid';
    }
  | {
      pageCount: number;
      status: 'inviable';
    }
  | {
      billingCycle: BillingCycle;
      monthlyTotalCents: number;
      pageCount: number;
      status: 'ready';
      unitPriceCents: number;
      yearlyTotalCents: number;
    };

const DEFAULT_CUSTOM_RULES: CustomPricingRules = {
  active: true,
  minClientPages: 21,
  consultationMinClientPages: 50,
  baseUnitPriceCents: 2000,
  stepClientPages: 5,
  stepIncrementCents: 200,
};

function formatCurrencyFromCents(valueCents: number) {
  const hasCents = valueCents % 100 !== 0;

  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    maximumFractionDigits: hasCents ? 2 : 0,
    minimumFractionDigits: hasCents ? 2 : 0,
    style: 'currency',
  }).format(valueCents / 100);
}

function applyYearlyDiscount(valueCents: number, yearlyDiscountPercent: number) {
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

function getCustomUnitMonthlyPriceCents(
  pageCount: number,
  customRules: CustomPricingRules,
) {
  if (pageCount >= customRules.consultationMinClientPages) {
    return null;
  }

  const priceSteps = Math.max(
    0,
    Math.floor(
      (pageCount - customRules.minClientPages) / customRules.stepClientPages,
    ),
  );

  return (
    customRules.baseUnitPriceCents +
    priceSteps * customRules.stepIncrementCents
  );
}

export function usePricingPlansDialogComponent() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [customCalculatorOpen, setCustomCalculatorOpen] = useState(false);
  const [customPagesOverride, setCustomPagesOverride] = useState<string | null>(
    null,
  );

  const {
    errorPricingPlans,
    isLoadingPricingPlans,
    pricingPlansCatalog,
    refetchPricingPlans,
  } = useGetPricingPlansUseCase();

  const yearlyDiscountPercent =
    pricingPlansCatalog?.yearlyDiscountPercent ?? 0;
  const customRules = pricingPlansCatalog?.custom ?? DEFAULT_CUSTOM_RULES;
  const pricingPlans = useMemo(
    () => (pricingPlansCatalog?.plans ?? []).filter((plan) => plan.active),
    [pricingPlansCatalog?.plans],
  );
  const customPages = customPagesOverride ?? String(customRules.minClientPages);

  const customEstimate = useMemo<CustomEstimate>(() => {
    const pageCount = Number(customPages);

    if (
      !Number.isInteger(pageCount) ||
      pageCount < customRules.minClientPages
    ) {
      return {
        status: 'invalid',
      };
    }

    const baseUnitPriceCents = getCustomUnitMonthlyPriceCents(
      pageCount,
      customRules,
    );

    if (!baseUnitPriceCents) {
      return {
        pageCount,
        status: 'inviable',
      };
    }

    const unitPriceCents = getMonthlyPriceForBillingCycle(
      baseUnitPriceCents,
      billingCycle,
      yearlyDiscountPercent,
    );
    const monthlyTotalCents = pageCount * unitPriceCents;

    return {
      billingCycle,
      monthlyTotalCents,
      pageCount,
      status: 'ready',
      unitPriceCents,
      yearlyTotalCents: monthlyTotalCents * 12,
    };
  }, [billingCycle, customPages, customRules, yearlyDiscountPercent]);

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
    customCalculatorOpen,
    customEstimate,
    customPages,
    customRules,
    errorPricingPlans,
    formatCurrencyFromCents,
    formatPlanMonthlyPrice,
    formatPlanYearlyTotal,
    isLoadingPricingPlans,
    pricingPlans,
    refetchPricingPlans,
    setBillingCycle,
    setCustomCalculatorOpen,
    setCustomPages: setCustomPagesOverride,
    yearlyDiscountPercent,
  };
}
