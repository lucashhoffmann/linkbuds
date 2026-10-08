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
    installmentCount: number;
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

/** Plan price with the card fee included: `totalCents` is what is charged. */
export interface IBillingQuote {
  planCode: string;
  planName: string;
  billingCycle: BillingCycle;
  baseCents: number;
  feeCents: number;
  totalCents: number;
  /**
   * With an active subscription in this cycle and a pricier plan: what
   * upgrading charges now (prorated, on the stored card). 0 = no charge.
   */
  upgrade?: {
    daysLeft: number;
    baseCents: number;
    feeCents: number;
    totalCents: number;
  } | null;
  /** Yearly only: card split options, each with its own fee (count 1 = totalCents). */
  installments: Array<{
    count: number;
    totalCents: number;
    installmentCents: number;
  }>;
}

export interface IBillingQuotes {
  method: 'CREDIT_CARD';
  quotes: IBillingQuote[];
}

export interface ISubscribeInput {
  planCode: string;
  billingCycle: BillingCycle;
  expectedTotalCents: number;
  installmentCount: number;
  holder: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone: string;
    postalCode: string;
    addressNumber: string;
  };
  card: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
}

/** One history entry with the receipt details (GET /billing/ledger/:id). */
export interface IBillingLedgerEntry {
  id: string;
  type: 'CHARGE' | 'PAYMENT' | 'REFUND' | 'CREDIT';
  description: string;
  amountCents: number;
  currency: string;
  createdAt: string;
  plan: { code: string; name: string } | null;
  billingCycle: BillingCycle | null;
  installments: { count: number; amountCents: number } | null;
  /** Plan price vs card fee passed to the payer; null for older entries. */
  breakdown: { planCents: number; feeCents: number } | null;
  transactionId: string | null;
  /** Live from the gateway; null when unavailable. */
  payment: {
    status: 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';
    card: { brand: string; last4: string } | null;
  } | null;
}
