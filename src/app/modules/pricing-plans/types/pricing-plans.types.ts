export type BillingCycle = 'monthly' | 'yearly';

export type PricingPlan = {
  code: string;
  name: string;
  label: string;
  description: string;
  maxClientPages: number | null;
  priceCents: number | null;
  priceLabel: string | null;
  features: string[];
  action: string;
  featured: boolean;
  /** Special-conditions card (no self-serve price). */
  custom: boolean;
};

export type PricingPlansResponse = {
  yearlyDiscountPercent: number;
  plans: PricingPlan[];
};
