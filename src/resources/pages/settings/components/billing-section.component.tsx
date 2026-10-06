import { Sparkles, Ticket } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSession } from '@/app/modules/auth/hooks';
import type { BillingCycle } from '@/app/modules/billing/types/billing.types';
import {
  useBillingMutations,
  useBillingOverviewUseCase,
} from '@/app/modules/billing/use-cases/use-billing.use-case';
import { SegmentedControl } from '@/resources/components/base/device-preview/device-preview.component';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';

const money = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    cents / 100,
  );
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
  const [searchParams, setSearchParams] = useSearchParams();
  const fakeSession =
    searchParams.get('checkout') === 'fake'
      ? searchParams.get('session')
      : null;

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
  const upgrades = data.prices.filter(
    (price) => price.code !== data.plan.code && price.monthlyCents > 0,
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
              onClick={() => {
                if (
                  window.confirm('Cancelar a assinatura ao fim do período?')
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

      {fakeSession && isOwner && (
        <div className='rounded-xl border border-dashed p-3 text-sm'>
          <p className='font-medium'>Pagamento de teste</p>
          <p className='text-muted-foreground text-xs'>
            Ambiente sem gateway real: simule a aprovação do pagamento.
          </p>
          <Button
            type='button'
            size='sm'
            className='mt-2'
            disabled={mutations.completeFakeCheckout.isPending}
            onClick={() =>
              mutations.completeFakeCheckout.mutate(fakeSession, {
                onSuccess: () => setSearchParams({}, { replace: true }),
              })
            }
          >
            Aprovar pagamento (teste)
          </Button>
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
                { value: 'YEARLY', label: 'Anual' },
              ]}
            />
          </div>
          {!data.providerConfigured && (
            <p className='text-muted-foreground text-xs'>
              Pagamento online em breve. Fale com a gente para assinar.
            </p>
          )}
          {upgrades.map((price) => {
            const cents =
              cycle === 'YEARLY' ? price.yearlyCents : price.monthlyCents;

            return (
              <div
                key={price.code}
                className='bg-background flex flex-wrap items-center gap-3 rounded-xl p-3'
              >
                <div className='min-w-0 flex-1'>
                  <p className='font-medium'>{price.name}</p>
                  <p className='text-muted-foreground text-xs'>
                    {money(cents)} / {cycle === 'YEARLY' ? 'ano' : 'mês'}
                  </p>
                </div>
                <Button
                  type='button'
                  size='sm'
                  disabled={
                    !data.providerConfigured || mutations.checkout.isPending
                  }
                  onClick={() =>
                    mutations.checkout.mutate({
                      planCode: price.code,
                      billingCycle: cycle,
                    })
                  }
                >
                  Assinar
                </Button>
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
              <li
                key={entry.id}
                className='flex items-center gap-3 py-2'
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
