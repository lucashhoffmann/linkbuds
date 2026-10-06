import { HttpAuth } from '@/app/api/api';
import type { BillingCycle, IBillingOverview } from '../types/billing.types';

type ApiResponse<T> = { data: T };

class BillingService {
  async overview(): Promise<IBillingOverview> {
    const { data } =
      await HttpAuth.get<ApiResponse<IBillingOverview>>('/billing');
    return data.data;
  }

  /** One idempotency key per user action: retries never open a 2nd checkout. */
  async checkout(
    planCode: string,
    billingCycle: BillingCycle,
    idempotencyKey: string,
  ) {
    const { data } = await HttpAuth.post<
      ApiResponse<{
        checkoutId: string;
        checkoutUrl: string;
        amountCents: number;
      }>
    >(
      '/billing/checkout',
      { planCode, billingCycle },
      {
        headers: { 'Idempotency-Key': idempotencyKey },
      },
    );
    return data.data;
  }

  async cancel() {
    await HttpAuth.post('/billing/cancel');
  }

  async redeemCoupon(code: string) {
    const { data } = await HttpAuth.post<
      ApiResponse<{ code: string; alreadyRedeemed: boolean }>
    >('/billing/coupons/redeem', { code });
    return data.data;
  }

  async completeFakeCheckout(sessionId: string) {
    await HttpAuth.post(`/billing/fake/checkouts/${sessionId}/complete`);
  }
}

export default new BillingService();
