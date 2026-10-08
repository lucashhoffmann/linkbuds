import { Check, Sparkles, Ticket } from 'lucide-react';
import { SegmentedControl } from '@/resources/components/base/device-preview/device-preview.component';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';
import { cn } from '@/shared/lib/utils';
import {
  formatDate as date,
  formatMoney as money,
} from '../subscribe-dialog/payment-format.util';
import { SubscribeDialog } from '../subscribe-dialog/subscribe-dialog.component';
import { useBillingSection } from './use-billing-section.component';

const STATUS_LABEL = {
  INCOMPLETE: 'Aguardando pagamento',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Pagamento pendente',
  CANCELED: 'Cancelada',
} as const;

function Limit({ label, value }: { label: string; value: string }) {
  return (
    <div className='bg-background rounded-xl p-3'>
      <p className='text-muted-foreground text-xs'>{label}</p>
      <p className='mt-0.5 text-sm font-semibold'>{value}</p>
    </div>
  );
}

/** Plan, special conditions/coupons and subscription (history: BillingHistorySection). */
export function BillingSection() {
  const {
    data,
    isOwner,
    subscription,
    subscribed,
    canCancel,
    effectivePlanName,
    upgrades,
    catalogPlan,
    yearlyDiscountPercent,
    cycle,
    setCycle,
    coupon,
    setCoupon,
    selected,
    setSelected,
    upgradePending,
    redeemPending,
    upgrade,
    cancel,
    redeem,
    onQuoteChanged,
  } = useBillingSection();

  if (!data) {
    return (
      <section className='bg-card rounded-2xl border p-4'>
        <p className='text-muted-foreground text-sm'>Carregando plano...</p>
      </section>
    );
  }

  const { entitlements } = data;

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

      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
        <Limit
          label='Clientes'
          value={`até ${entitlements.maxClientPages}`}
        />
        <Limit
          label='Usuários'
          value={`até ${entitlements.maxMembers}`}
        />
        <Limit
          label='Formulários'
          value={`até ${entitlements.maxForms}`}
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
              onClick={() => void cancel()}
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
                  label:
                    yearlyDiscountPercent !== undefined
                      ? `Anual -${yearlyDiscountPercent}%`
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
            const plan = catalogPlan(item.planCode);
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
                    {item.upgrade && (
                      <p className='text-primary mt-1 text-xs font-medium'>
                        {item.upgrade.totalCents > 0
                          ? `Upgrade hoje: ${money(item.upgrade.totalCents)} pelos ${item.upgrade.daysLeft} dias restantes`
                          : 'Upgrade hoje sem cobrança (perto da renovação)'}
                      </p>
                    )}
                  </div>
                  {item.upgrade ? (
                    <Button
                      type='button'
                      disabled={upgradePending}
                      onClick={() => void upgrade(item)}
                    >
                      Fazer upgrade
                    </Button>
                  ) : (
                    <Button
                      type='button'
                      disabled={!data.providerConfigured || subscribed}
                      onClick={() => setSelected(item)}
                    >
                      Assinar {item.planName}
                    </Button>
                  )}
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
            disabled={!coupon.trim() || redeemPending}
          >
            <Ticket className='size-4' />
            Aplicar cupom
          </Button>
        </form>
      )}

      <SubscribeDialog
        quote={selected}
        onClose={() => setSelected(null)}
        onQuoteChanged={onQuoteChanged}
      />
    </section>
  );
}
