import { useQueryCache } from '@/app/cache/use-query-cache';
import { PricingPlansQueryKeys } from '../keys/pricing-plans.keys';
import pricingPlansService from '../service/pricing-plans.service';

export function useGetPricingPlansUseCase() {
  const { data, error, isLoading, refetch } = useQueryCache({
    queryKey: [PricingPlansQueryKeys.GET_PRICING_PLANS],
    queryFn: () => pricingPlansService.getPricingPlans(),
  });

  // Optional: without it the dialog falls back to catalog prices.
  const { data: publicQuote } = useQueryCache({
    queryKey: [PricingPlansQueryKeys.GET_PUBLIC_QUOTE],
    queryFn: () => pricingPlansService.getPublicQuote(),
    retry: false,
  });

  return {
    pricingPlansCatalog: data,
    publicQuote,
    errorPricingPlans: error,
    isLoadingPricingPlans: isLoading,
    refetchPricingPlans: refetch,
  };
}
