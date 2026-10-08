import { useState } from 'react';
import { useSession } from '@/app/modules/auth/hooks';
import type { IBillingQuote } from '@/app/modules/billing/types/billing.types';
import { useBillingQuoteUseCase } from '@/app/modules/billing/use-cases/use-billing.use-case';
import type { BillingCycle } from '@/app/modules/pricing-plans/types/pricing-plans.types';

export function useWelcomePlansDialog(onClose: () => void) {
  const { company, userAuthenticated } = useSession();
  const firstName = userAuthenticated?.name.split(' ')[0];
  const isOwner = userAuthenticated?.role === 'OWNER';
  // Charged prices (card fee included): what the checkout needs.
  const quote = useBillingQuoteUseCase(isOwner);
  const [selected, setSelected] = useState<IBillingQuote | null>(null);

  /** Checkout quote of a catalog plan in the cycle picked on the cards. */
  const checkoutFor = (planCode: string, billingCycle: BillingCycle) =>
    quote.data?.quotes.find(
      (item) =>
        item.planCode === planCode &&
        item.billingCycle ===
          (billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY'),
    );

  /** Paid or gave up on the checkout: the welcome is over. */
  function closeCheckout() {
    setSelected(null);
    onClose();
  }

  function onQuoteChanged() {
    setSelected(null);
    void quote.refetch();
  }

  return {
    title: firstName ? `Bem-vindo, ${firstName}!` : 'Bem-vindo ao LinkBuds!',
    currentPlanCode: company?.entitlements.planCode,
    selected,
    setSelected,
    checkoutFor,
    closeCheckout,
    onQuoteChanged,
  };
}
