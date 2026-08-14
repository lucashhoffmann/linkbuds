import { useQueryCache } from '@/app/cache/use-query-cache';
import { PricingPlansQueryKeys } from '../keys/pricing-plans.keys';
import pricingPlansService from '../service/pricing-plans.service';

export function useGetPricingPlansUseCase() {
  const { data, error, isLoading, refetch } = useQueryCache({
    queryKey: [PricingPlansQueryKeys.GET_PRICING_PLANS],
    queryFn: () => pricingPlansService.getPricingPlans(),
  });

  return {
    pricingPlansCatalog: data,
    errorPricingPlans: error,
    isLoadingPricingPlans: isLoading,
    refetchPricingPlans: refetch,
  };
}
