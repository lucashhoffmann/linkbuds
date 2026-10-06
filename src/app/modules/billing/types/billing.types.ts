import type { ICompanyEntitlements } from '@/shared/types/auth.types';

export type BillingCycle = 'MONTHLY' | 'YEARLY';

export interface IBillingOverview {
  providerConfigured: boolean;
  provider: string | null;
  plan: { code: string; name: string };
  entitlements: ICompanyEntitlements;
  specialCondition: {
    note: string | null;
    endsAt: string | null;
    coupon: string | null;
  } | null;
  subscription: {
    status: 'INCOMPLETE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
    plan: { code: string; name: string };
    billingCycle: BillingCycle;
    amountCents: number;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  prices: Array<{
    code: string;
    name: string;
    monthlyCents: number;
    yearlyCents: number;
  }>;
  balanceCents: number;
  ledger: Array<{
    id: string;
    type: 'CHARGE' | 'PAYMENT' | 'REFUND' | 'CREDIT';
    amountCents: number;
    currency: string;
    description: string;
    createdAt: string;
  }>;
}
