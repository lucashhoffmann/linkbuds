import { useQueryClient } from '@tanstack/react-query';
import { useMutationCache } from '@/app/cache/use-mutation-cache';
import { useQueryCache } from '@/app/cache/use-query-cache';
import authService from '@/app/modules/auth/service/auth.service';
import { useAuthStore } from '@/app/store/auth-store/use-auth-store';
import { axiosErrorHandler } from '@/shared/utils/axios-error-handler.util';
import { BillingQueryKeys } from '../keys/billing.keys';
import billingService from '../service/billing.service';
import type { BillingCycle } from '../types/billing.types';

export function useBillingOverviewUseCase() {
  return useQueryCache({
    queryKey: [BillingQueryKeys.OVERVIEW],
    queryFn: () => billingService.overview(),
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
    checkout: useMutationCache({
      mutationFn: ({
        planCode,
        billingCycle,
      }: {
        planCode: string;
        billingCycle: BillingCycle;
      }) =>
        billingService.checkout(planCode, billingCycle, crypto.randomUUID()),
      onSuccess: ({ checkoutUrl }) => window.location.assign(checkoutUrl),
      onError,
    }),
    cancel: useMutationCache({
      mutationFn: () => billingService.cancel(),
      onSuccess: refresh,
      onError,
    }),
    completeFakeCheckout: useMutationCache({
      mutationFn: (sessionId: string) =>
        billingService.completeFakeCheckout(sessionId),
      onSuccess: refresh,
      onError,
    }),
  };
}
