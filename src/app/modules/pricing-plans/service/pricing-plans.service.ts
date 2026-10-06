import { Http } from '@/app/api/api';
import type { IBillingQuotes } from '@/app/modules/billing/types/billing.types';
import type { PricingPlansResponse } from '../types/pricing-plans.types';

class PricingPlansService {
  async getPricingPlans(): Promise<PricingPlansResponse> {
    const { data } = await Http.get('/pricing-plans');

    return data.data;
  }

  /** Catalog prices with the card fee included (what is actually charged). */
  async getPublicQuote(): Promise<IBillingQuotes> {
    const { data } = await Http.get('/billing/quote/public');

    return data.data;
  }
}

export default new PricingPlansService();
