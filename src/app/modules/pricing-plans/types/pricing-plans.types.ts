export type BillingCycle = 'monthly' | 'yearly';

export type PricingPlanType = 'FREE' | 'AGENCY' | 'CUSTOM';

export type PricingPlan = {
  code: PricingPlanType;
  type: PricingPlanType;
  name: string;
  label: string;
  description: string;
  maxClientPages: number | null;
  priceCents: number | null;
  priceLabel: string | null;
  features: string[];
  action: string;
  active: boolean;
  featured: boolean;
  custom: boolean;
};

export type CustomPricingRules = {
  active: boolean;
  minClientPages: number;
  consultationMinClientPages: number;
  baseUnitPriceCents: number;
  stepClientPages: number;
  stepIncrementCents: number;
};

export type PricingPlansResponse = {
  yearlyDiscountPercent: number;
  custom: CustomPricingRules;
  plans: PricingPlan[];
};
