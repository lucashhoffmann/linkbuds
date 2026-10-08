import { type FormEvent, useState } from 'react';
import { useSession } from '@/app/modules/auth/hooks';
import type {
  BillingCycle,
  IBillingQuote,
} from '@/app/modules/billing/types/billing.types';
import {
  useBillingMutations,
  useBillingOverviewUseCase,
  useBillingQuoteUseCase,
} from '@/app/modules/billing/use-cases/use-billing.use-case';
import { useGetPricingPlansUseCase } from '@/app/modules/pricing-plans/use-cases/use-get-pricing-plans.use-case';
import { confirmAction } from '@/resources/components/base';
import {
  formatDate as date,
  formatMoney as money,
} from '../subscribe-dialog/payment-format.util';
import type { IUpgradeResult } from '../upgrade-success-dialog.component';

export function useBillingSection() {
  const { userAuthenticated } = useSession();
  const isOwner = userAuthenticated?.role === 'OWNER';
  const { data } = useBillingOverviewUseCase();
  const mutations = useBillingMutations();
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');
  const [coupon, setCoupon] = useState('');
  const [selected, setSelected] = useState<IBillingQuote | null>(null);
  const [upgraded, setUpgraded] = useState<IUpgradeResult | null>(null);
  const quote = useBillingQuoteUseCase(isOwner);
  // Catalog copy (description, features) so the upgrade shows what it unlocks.
  const { pricingPlansCatalog } = useGetPricingPlansUseCase();

  const subscription = data?.subscription ?? null;
  // A special condition can grant another plan than the company's base one.
  const effectivePlanName =
    data?.prices.find((price) => price.code === data.entitlements.planCode)
      ?.name ?? data?.plan.name;
  // Prices as charged (card fee included), for plans other than the current one.
  const upgrades = (quote.data?.quotes ?? []).filter(
    (item) => item.planCode !== data?.plan.code && item.billingCycle === cycle,
  );
  const subscribed = Boolean(
    subscription && ['ACTIVE', 'PAST_DUE'].includes(subscription.status),
  );
  const canCancel = isOwner && subscribed && !subscription?.cancelAtPeriodEnd;

  const catalogPlan = (code: string) =>
    pricingPlansCatalog?.plans.find((plan) => plan.code === code);

  /** Prorated charge on the subscription's card; renews at the new price. */
  async function upgrade(item: IBillingQuote) {
    if (!item.upgrade || !subscription) return;

    // Renewal keeps the subscription's installments (their fee tier).
    const renewalCents =
      item.installments.find(
        (option) => option.count === subscription.installmentCount,
      )?.totalCents ?? item.totalCents;
    const renewal = `A partir de ${date(subscription.currentPeriodEnd)}, ${money(renewalCents)}/${cycle === 'YEARLY' ? 'ano' : 'mês'}.`;

    if (
      await confirmAction({
        title: `Fazer upgrade para ${item.planName}?`,
        description:
          item.upgrade.totalCents > 0
            ? `Cobramos ${money(item.upgrade.totalCents)} agora no cartão da assinatura: a diferença proporcional aos ${item.upgrade.daysLeft} dias que faltam. ${renewal}`
            : `Sem cobrança agora: faltam poucos dias para a renovação. ${renewal}`,
        confirmLabel:
          item.upgrade.totalCents > 0
            ? `Pagar ${money(item.upgrade.totalCents)}`
            : 'Fazer upgrade',
      })
    ) {
      mutations.upgrade.mutate(
        {
          planCode: item.planCode,
          expectedTotalCents: item.upgrade.totalCents,
        },
        {
          onSuccess: ({ chargedCents }) =>
            setUpgraded({ planName: item.planName, chargedCents, renewal }),
        },
      );
    }
  }

  async function cancel() {
    if (
      await confirmAction({
        title: 'Cancelar assinatura?',
        description: `As renovações param. O plano continua até ${date(subscription?.currentPeriodEnd ?? null)} e depois volta para o Grátis.`,
        confirmLabel: 'Cancelar assinatura',
        cancelLabel: 'Manter',
        destructive: true,
      })
    ) {
      mutations.cancel.mutate(undefined);
    }
  }

  function redeem(event: FormEvent) {
    event.preventDefault();
    mutations.redeemCoupon.mutate(coupon, { onSuccess: () => setCoupon('') });
  }

  /** The server total changed (409): drop the form and refresh the prices. */
  function onQuoteChanged() {
    setSelected(null);
    void quote.refetch();
  }

  return {
    data,
    isOwner,
    subscription,
    subscribed,
    canCancel,
    effectivePlanName,
    upgrades,
    catalogPlan,
    yearlyDiscountPercent: pricingPlansCatalog?.yearlyDiscountPercent,
    cycle,
    setCycle,
    coupon,
    setCoupon,
    selected,
    setSelected,
    upgraded,
    closeUpgraded: () => setUpgraded(null),
    upgradePending: mutations.upgrade.isPending,
    redeemPending: mutations.redeemCoupon.isPending,
    upgrade,
    cancel,
    redeem,
    onQuoteChanged,
  };
}
