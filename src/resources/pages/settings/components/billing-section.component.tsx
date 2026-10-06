import { confirmAction } from '@/resources/components/base';
import { Check, ChevronRight, Sparkles, Ticket } from 'lucide-react';
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
import { SegmentedControl } from '@/resources/components/base/device-preview/device-preview.component';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { formatMoney as money } from './subscribe-dialog/payment-format.util';
import { LedgerEntryDialog } from './ledger-entry-dialog.component';
import { SubscribeDialog } from './subscribe-dialog/subscribe-dialog.component';
const date = (value: string | null) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : '—';

const STATUS_LABEL = {
  INCOMPLETE: 'Aguardando pagamento',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Pagamento pendente',
  CANCELED: 'Cancelada',
} as const;

const LEDGER_LABEL = {
  CHARGE: 'Cobrança',
  PAYMENT: 'Pagamento',
  REFUND: 'Estorno',
  CREDIT: 'Crédito',
} as const;

function Limit({ label, value }: { label: string; value: string }) {
  return (
    <div className='bg-background rounded-xl p-3'>
      <p className='text-muted-foreground text-xs'>{label}</p>
      <p className='mt-0.5 text-sm font-semibold'>{value}</p>
    </div>
  );
}

/** Plan, special conditions/coupons, subscription and billing history. */
export function BillingSection() {
  const { userAuthenticated } = useSession();
  const isOwner = userAuthenticated?.role === 'OWNER';
  const { data } = useBillingOverviewUseCase();
  const mutations = useBillingMutations();
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');
  const [coupon, setCoupon] = useState('');
  const [selected, setSelected] = useState<IBillingQuote | null>(null);
  const [openEntry, setOpenEntry] = useState<string | null>(null);
  const quote = useBillingQuoteUseCase(isOwner);
  // Catalog copy (description, features) so the upgrade shows what it unlocks.
  const { pricingPlansCatalog } = useGetPricingPlansUseCase();

  if (!data) {
    return (
      <section className='bg-card rounded-2xl border p-4'>
        <p className='text-muted-foreground text-sm'>Carregando plano...</p>
      </section>
    );
  }

  const { entitlements, subscription } = data;
  // A special condition can grant another plan than the company's base one.
  const effectivePlanName =
    data.prices.find((price) => price.code === entitlements.planCode)?.name ??
    data.plan.name;
  // Prices as charged (card fee included), for plans other than the current one.
  const upgrades = (quote.data?.quotes ?? []).filter(
    (item) => item.planCode !== data.plan.code && item.billingCycle === cycle,
  );
  const canCancel =
    isOwner &&
    subscription &&
    ['ACTIVE', 'PAST_DUE'].includes(subscription.status) &&
    !subscription.cancelAtPeriodEnd;

  function redeem(event: FormEvent) {
    event.preventDefault();
    mutations.redeemCoupon.mutate(coupon, { onSuccess: () => setCoupon('') });
  }

  return (
    <section className='bg-card grid grid-cols-[minmax(0,1fr)] gap-4 rounded-2xl border p-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Sparkles className='text-muted-foreground size-4' />
        <h2 className='font-semibold'>Plano {effectivePlanName}</h2>
        {data.specialCondition && (
          <span className='bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs'>
            {data.specialCondition.coupon
              ? `Cupom ${data.specialCondition.coupon}`
              : 'Condição especial'}
            {data.specialCondition.endsAt &&
              ` até ${date(data.specialCondition.endsAt)}`}
          </span>
        )}
      </div>

      <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
        <Limit
          label='Clientes'
          value={`até ${entitlements.maxClientPages}`}
        />
        <Limit
          label='Usuários'
          value={`até ${entitlements.maxMembers}`}
        />
        <Limit
          label='Analytics'
          value={
            entitlements.analyticsTier === 'FULL'
              ? 'Completo'
              : 'Básico (7 dias)'
          }
        />
        <Limit
          label='Remover marca'
          value={entitlements.whiteLabel ? 'Incluído' : 'Não incluído'}
        />
      </div>

      {subscription && (
        <div className='bg-muted grid gap-1 rounded-xl p-3 text-sm'>
          <p>
            Assinatura {subscription.plan.name} ·{' '}
            {subscription.billingCycle === 'YEARLY' ? 'anual' : 'mensal'} ·{' '}
            {money(subscription.amountCents)}
            {subscription.installmentCount > 1 &&
              ` em ${subscription.installmentCount}x`}
          </p>
          <p className='text-muted-foreground text-xs'>
            {STATUS_LABEL[subscription.status]}
            {subscription.cancelAtPeriodEnd
              ? ` · termina em ${date(subscription.currentPeriodEnd)}`
              : ` · renova em ${date(subscription.currentPeriodEnd)}`}
          </p>
          {canCancel && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mt-1 w-fit'
              onClick={async () => {
                if (
                  await confirmAction({
                    title: 'Cancelar assinatura?',
                    description: `As renovações param. O plano continua até ${date(subscription.currentPeriodEnd)} e depois volta para o Grátis.`,
                    confirmLabel: 'Cancelar assinatura',
                    cancelLabel: 'Manter',
                    destructive: true,
                  })
                ) {
                  mutations.cancel.mutate(undefined);
                }
              }}
            >
              Cancelar assinatura
            </Button>
          )}
        </div>
      )}

      {isOwner && upgrades.length > 0 && (
        <div className='grid gap-3'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <h3 className='text-sm font-medium'>Mudar de plano</h3>
            <SegmentedControl
              label='Ciclo de cobrança'
              value={cycle}
              onChange={setCycle}
              options={[
                { value: 'MONTHLY', label: 'Mensal' },
                {
                  value: 'YEARLY',
                  label: pricingPlansCatalog
                    ? `Anual -${pricingPlansCatalog.yearlyDiscountPercent}%`
                    : 'Anual',
                },
              ]}
            />
          </div>
          {!data.providerConfigured && (
            <p className='text-muted-foreground text-xs'>
              Pagamento online em breve. Fale com a gente para assinar.
            </p>
          )}
          {upgrades.map((item) => {
            const plan = pricingPlansCatalog?.plans.find(
              (catalogPlan) => catalogPlan.code === item.planCode,
            );
            return (
              <div
                key={item.planCode}
                className={cn(
                  'bg-background grid gap-3 rounded-xl border p-4',
                  plan?.featured && 'border-primary shadow-sm',
                )}
              >
                <div className='flex flex-wrap items-start gap-3'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='text-lg font-semibold'>{item.planName}</p>
                      {plan?.label && (
                        <span className='bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs'>
                          {plan.label}
                        </span>
                      )}
                    </div>
                    {plan?.description && (
                      <p className='text-muted-foreground mt-0.5 text-sm'>
                        {plan.description}
                      </p>
                    )}
                    <p className='mt-2 text-sm'>
                      <span className='text-xl font-semibold'>
                        {money(item.totalCents)}
                      </span>{' '}
                      / {cycle === 'YEARLY' ? 'ano' : 'mês'}
                      {item.installments.length > 1 && (
                        <span className='text-muted-foreground text-xs'>
                          {` · ou até ${item.installments.at(-1)!.count}x no cartão`}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    type='button'
                    disabled={
                      !data.providerConfigured ||
                      Boolean(
                        subscription &&
                        ['ACTIVE', 'PAST_DUE'].includes(subscription.status),
                      )
                    }
                    onClick={() => setSelected(item)}
                  >
                    Assinar {item.planName}
                  </Button>
                </div>
                {plan && plan.features.length > 0 && (
                  <ul className='grid gap-1.5 text-sm sm:grid-cols-2'>
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className='flex gap-2'
                      >
                        <Check className='text-primary mt-0.5 size-4 shrink-0' />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isOwner && (
        <form
          className='flex flex-col gap-2 sm:flex-row sm:items-end'
          onSubmit={redeem}
        >
          <div className='grid flex-1 gap-1.5'>
            <Label htmlFor='coupon-code'>Cupom</Label>
            <Input
              id='coupon-code'
              placeholder='CÓDIGO'
              autoCapitalize='characters'
              value={coupon}
              onChange={(event) => setCoupon(event.target.value)}
            />
          </div>
          <Button
            type='submit'
            variant='outline'
            disabled={!coupon.trim() || mutations.redeemCoupon.isPending}
          >
            <Ticket className='size-4' />
            Aplicar cupom
          </Button>
        </form>
      )}

      {data.ledger.length > 0 && (
        <div className='grid gap-1'>
          <h3 className='text-sm font-medium'>Histórico</h3>
          <ul className='divide-y text-sm'>
            {data.ledger.map((entry) => (
              <li key={entry.id}>
                <button
                  type='button'
                  className='hover:bg-muted/60 focus-visible:ring-ring/50 -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors outline-none focus-visible:ring-[3px]'
                  onClick={() => setOpenEntry(entry.id)}
                >
                  <span className='text-muted-foreground hidden w-20 shrink-0 text-xs sm:inline'>
                    {date(entry.createdAt)}
                  </span>
                  <span className='min-w-0 flex-1 truncate'>
                    {LEDGER_LABEL[entry.type]} · {entry.description}
                  </span>
                  <span className='shrink-0 font-medium'>
                    {money(entry.amountCents)}
                  </span>
                  <ChevronRight className='text-muted-foreground size-4 shrink-0' />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <LedgerEntryDialog
        entryId={openEntry}
        onClose={() => setOpenEntry(null)}
      />
      <SubscribeDialog
        quote={selected}
        onClose={() => setSelected(null)}
        onQuoteChanged={() => {
          setSelected(null);
          void quote.refetch();
        }}
      />
    </section>
  );
}
