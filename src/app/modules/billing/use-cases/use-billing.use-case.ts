import { useQueryClient } from '@tanstack/react-query';
import { useMutationCache } from '@/app/cache/use-mutation-cache';
import { useQueryCache } from '@/app/cache/use-query-cache';
import authService from '@/app/modules/auth/service/auth.service';
import { useAuthStore } from '@/app/store/auth-store/use-auth-store';
import { axiosErrorHandler } from '@/shared/utils/axios-error-handler.util';
import { BillingQueryKeys } from '../keys/billing.keys';
import billingService from '../service/billing.service';
import type { ISubscribeInput } from '../types/billing.types';

export function useBillingOverviewUseCase() {
  return useQueryCache({
    queryKey: [BillingQueryKeys.OVERVIEW],
    queryFn: () => billingService.overview(),
  });
}

/** Prices with the card fee included, as charged. */
export function useBillingQuoteUseCase(enabled = true) {
  return useQueryCache({
    queryKey: [BillingQueryKeys.QUOTE],
    queryFn: () => billingService.quote(),
    enabled,
  });
}

/** Receipt details of one history entry; fetched only while it is open. */
export function useBillingLedgerEntryUseCase(id: string | null) {
  return useQueryCache({
    queryKey: [BillingQueryKeys.LEDGER_ENTRY, id],
    queryFn: () => billingService.ledgerEntry(id!),
    enabled: Boolean(id),
  });
}

export function useBillingMutations() {
  const queryClient = useQueryClient();
  const handleSetUserAuth = useAuthStore((state) => state.handleSetUserAuth);

  // Plan/coupon changes alter entitlements: refresh billing + the session.
  const refresh = async () => {
    await queryClient.invalidateQueries();
    handleSetUserAuth({ auth: await authService.getSessionAuthService() });
  };
  const onError = axiosErrorHandler;

  return {
    redeemCoupon: useMutationCache({
      mutationFn: (code: string) => billingService.redeemCoupon(code),
      onSuccess: refresh,
      onError,
    }),
    // Errors are shown inside the payment form, not as a toast.
    subscribe: useMutationCache({
      mutationFn: ({
        input,
        idempotencyKey,
      }: {
        input: ISubscribeInput;
        idempotencyKey: string;
      }) => billingService.subscribe(input, idempotencyKey),
      onSuccess: refresh,
    }),
    upgrade: useMutationCache({
      mutationFn: (input: { planCode: string; expectedTotalCents: number }) =>
        billingService.upgrade(input, crypto.randomUUID()),
      onSuccess: refresh,
      // A changed total (days went by) needs the fresh quote on screen.
      onError: async (error) => {
        axiosErrorHandler(error);
        await queryClient.invalidateQueries({
          queryKey: [BillingQueryKeys.QUOTE],
        });
      },
    }),
    cancel: useMutationCache({
      mutationFn: () => billingService.cancel(),
      onSuccess: refresh,
      onError,
    }),
  };
}
