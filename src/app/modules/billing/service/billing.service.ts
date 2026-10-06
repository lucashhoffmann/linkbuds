import { HttpAuth } from '@/app/api/api';
import type {
  IBillingLedgerEntry,
  IBillingOverview,
  IBillingQuotes,
  ISubscribeInput,
} from '../types/billing.types';

type ApiResponse<T> = { data: T };

class BillingService {
  async overview(): Promise<IBillingOverview> {
    const { data } =
      await HttpAuth.get<ApiResponse<IBillingOverview>>('/billing');
    return data.data;
  }

  async ledgerEntry(id: string): Promise<IBillingLedgerEntry> {
    const { data } = await HttpAuth.get<ApiResponse<IBillingLedgerEntry>>(
      `/billing/ledger/${id}`,
    );
    return data.data;
  }

  async quote(): Promise<IBillingQuotes> {
    const { data } =
      await HttpAuth.get<ApiResponse<IBillingQuotes>>('/billing/quote');
    return data.data;
  }

  /** Same key on a network retry: the API answers once, never charges twice. */
  async subscribe(input: ISubscribeInput, idempotencyKey: string) {
    const { data } = await HttpAuth.post<
      ApiResponse<{
        checkoutId: string;
        status: 'ACTIVE' | 'PENDING';
        planCode: string;
        amountCents: number;
      }>
    >('/billing/subscribe', input, {
      headers: { 'Idempotency-Key': idempotencyKey },
      keepPageOnServerError: true,
    });
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
}

export default new BillingService();
