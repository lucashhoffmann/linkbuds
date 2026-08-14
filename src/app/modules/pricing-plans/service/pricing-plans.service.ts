import { Http } from '@/app/api/api';
import type { PricingPlansResponse } from '../types/pricing-plans.types';

class PricingPlansService {
  async getPricingPlans(): Promise<PricingPlansResponse> {
    const { data } = await Http.get('/pricing-plans');

    return data.data;
  }
}

export default new PricingPlansService();
