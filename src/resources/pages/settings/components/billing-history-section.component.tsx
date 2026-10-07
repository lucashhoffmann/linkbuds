import { addMonths } from 'date-fns';
import { CalendarClock, ChevronRight, History } from 'lucide-react';
import { useState } from 'react';
import type { IBillingOverview } from '@/app/modules/billing/types/billing.types';
import { useBillingOverviewUseCase } from '@/app/modules/billing/use-cases/use-billing.use-case';
import { formatMoney as money } from './subscribe-dialog/payment-format.util';
import { LedgerEntryDialog } from './ledger-entry-dialog.component';

const date = (value: Date | string) =>
  new Date(value).toLocaleDateString('pt-BR');

const LEDGER_LABEL = {
  CHARGE: 'Cobrança',
  PAYMENT: 'Pagamento',
  REFUND: 'Estorno',
  CREDIT: 'Crédito',
} as const;

interface IUpcomingEntry {
  date: Date;
  description: string;
  amountCents: number | null;
}

/**
 * What is still to come, derived from the subscription: card installments
 * left on the current period (installment 1 is already in the history) and
 * the renewal — or the downgrade, when renewals were canceled.
 */
export function upcomingEntries(
  subscription: IBillingOverview['subscription'],
  now = new Date(),
): IUpcomingEntry[] {
  if (
    !subscription?.currentPeriodEnd ||
    !['ACTIVE', 'PAST_DUE'].includes(subscription.status)
  ) {
    return [];
  }
  const end = new Date(subscription.currentPeriodEnd);
  const count = subscription.installmentCount;
  const entries: IUpcomingEntry[] = [];

  if (count > 1) {
    // Installments only exist on the yearly cycle.
    const start = addMonths(end, -12);
    for (let index = 1; index < count; index++) {
      const due = addMonths(start, index);
      if (due > now) {
        entries.push({
          date: due,
          description: `Parcela ${index + 1}/${count} na fatura do cartão`,
          amountCents: Math.floor(subscription.amountCents / count),
        });
      }
    }
  }

  entries.push(
    subscription.cancelAtPeriodEnd
      ? {
          date: end,
          description: `Fim do plano ${subscription.plan.name} · volta para o Grátis`,
          amountCents: null,
        }
      : {
          date: end,
          description: `Renovação ${subscription.plan.name} · ${
            subscription.billingCycle === 'YEARLY' ? 'anual' : 'mensal'
          }${count > 1 ? ` em ${count}x` : ''}`,
          amountCents: subscription.amountCents,
        },
  );
  return entries;
}

/** Upcoming charges and the billing history (ledger) with receipts. */
export function BillingHistorySection() {
  const { data } = useBillingOverviewUseCase();
  const [openEntry, setOpenEntry] = useState<string | null>(null);

  if (!data) {
    return (
      <section className='bg-card rounded-2xl border p-4'>
        <p className='text-muted-foreground text-sm'>Carregando histórico...</p>
      </section>
    );
  }

  const upcoming = upcomingEntries(data.subscription);

  return (
    <>
      <section className='bg-card grid gap-2 rounded-2xl border p-4'>
        <div className='flex items-center gap-2'>
          <CalendarClock className='text-muted-foreground size-4' />
          <h2 className='font-semibold'>Próximos lançamentos</h2>
        </div>
        {upcoming.length === 0 ? (
          <p className='text-muted-foreground text-sm'>
            Nenhuma cobrança programada.
          </p>
        ) : (
          <ul className='divide-y text-sm'>
            {upcoming.map((entry) => (
              <li
                key={`${entry.date.toISOString()}-${entry.description}`}
                className='flex items-center gap-3 py-2'
              >
                <span className='text-muted-foreground w-20 shrink-0 text-xs'>
                  {date(entry.date)}
                </span>
                <span className='min-w-0 flex-1 truncate'>
                  {entry.description}
                </span>
                {entry.amountCents !== null && (
                  <span className='shrink-0 font-medium'>
                    {money(entry.amountCents)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className='bg-card grid gap-2 rounded-2xl border p-4'>
        <div className='flex items-center gap-2'>
          <History className='text-muted-foreground size-4' />
          <h2 className='font-semibold'>Histórico</h2>
        </div>
        {data.ledger.length === 0 ? (
          <p className='text-muted-foreground text-sm'>
            Nenhum lançamento ainda.
          </p>
        ) : (
          <ul className='divide-y text-sm'>
            {data.ledger.map((entry) => (
              <li key={entry.id}>
                <button
                  type='button'
                  className='hover:bg-muted/60 focus-visible:ring-ring/50 -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors outline-none focus-visible:ring-[3px]'
                  onClick={() => setOpenEntry(entry.id)}
                >
                  <span className='text-muted-foreground w-20 shrink-0 text-xs'>
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
        )}
      </section>

      <LedgerEntryDialog
        entryId={openEntry}
        onClose={() => setOpenEntry(null)}
      />
    </>
  );
}
