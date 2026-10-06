import { Copy, ExternalLink, ReceiptText } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import type { IBillingLedgerEntry } from '@/app/modules/billing/types/billing.types';
import { useBillingLedgerEntryUseCase } from '@/app/modules/billing/use-cases/use-billing.use-case';
import { Button } from '@/resources/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/resources/components/ui/dialog';
import { Skeleton } from '@/resources/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { formatMoney as money } from './subscribe-dialog/payment-format.util';

const TYPE_LABEL = {
  CHARGE: 'Cobrança',
  PAYMENT: 'Pagamento',
  REFUND: 'Estorno',
  CREDIT: 'Crédito',
} as const;

const STATUS = {
  PAID: { label: 'Pago', className: 'bg-secondary text-secondary-foreground' },
  PENDING: { label: 'Pendente', className: 'bg-muted text-muted-foreground' },
  REFUNDED: { label: 'Estornado', className: 'bg-muted text-foreground' },
  FAILED: {
    label: 'Não aprovado',
    className: 'bg-destructive/10 text-destructive',
  },
} as const;

const dateTime = (value: string) => {
  const date = new Date(value);

  return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString(
    'pt-BR',
    { hour: '2-digit', minute: '2-digit' },
  )}`;
};

function Row({
  label,
  children,
  strong,
}: {
  label: string;
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className='flex items-baseline justify-between gap-4 py-2.5 text-sm'>
      <dt className='text-muted-foreground shrink-0'>{label}</dt>
      <dd
        className={cn(
          'min-w-0 text-right break-words',
          strong && 'font-semibold',
        )}
      >
        {children}
      </dd>
    </div>
  );
}

function paymentMethod(entry: IBillingLedgerEntry) {
  const card = entry.payment?.card;
  const split = entry.installments
    ? `${entry.installments.count}x de ${money(entry.installments.amountCents)}`
    : 'à vista';

  return card
    ? `${card.brand} •••• ${card.last4} · ${split}`
    : `Cartão de crédito · ${split}`;
}

async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success('Copiado');
  } catch {
    toast.error('Não foi possível copiar.');
  }
}

/** Receipt view of one history entry: when, what, plan vs card fee, card. */
export function LedgerEntryDialog({
  entryId,
  onClose,
}: {
  entryId: string | null;
  onClose: () => void;
}) {
  const { data: entry, isLoading } = useBillingLedgerEntryUseCase(entryId);
  const status = entry?.payment ? STATUS[entry.payment.status] : null;

  return (
    <Dialog
      open={Boolean(entryId)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className='max-h-[calc(100dvh-1rem)] gap-0 overflow-y-auto p-0 sm:max-w-md'>
        {isLoading || !entry ? (
          <div
            className='grid gap-3 p-6'
            aria-busy='true'
          >
            <DialogTitle className='sr-only'>Carregando lançamento</DialogTitle>
            <DialogDescription className='sr-only'>
              Buscando os detalhes da transação.
            </DialogDescription>
            <Skeleton className='h-5 w-24' />
            <Skeleton className='h-9 w-40' />
            <Skeleton className='mt-3 h-32 w-full' />
          </div>
        ) : (
          <>
            <div className='bg-muted/70 grid gap-1 p-6 pr-12 sm:rounded-t-lg'>
              <div className='flex flex-wrap items-center gap-2'>
                <ReceiptText className='text-muted-foreground size-4' />
                <DialogTitle className='text-sm font-medium'>
                  {TYPE_LABEL[entry.type]}
                </DialogTitle>
                {status && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                )}
              </div>
              <p className='text-3xl font-semibold tracking-tight'>
                {entry.type === 'REFUND' ? '− ' : ''}
                {money(entry.amountCents)}
              </p>
              <DialogDescription>{dateTime(entry.createdAt)}</DialogDescription>
            </div>

            <dl className='divide-y px-6 py-2'>
              <Row label='Descrição'>{entry.description}</Row>
              {entry.plan && (
                <Row label='Plano'>
                  {entry.plan.name}
                  {entry.billingCycle &&
                    ` · ${entry.billingCycle === 'YEARLY' ? 'anual' : 'mensal'}`}
                </Row>
              )}
              {entry.breakdown && (
                <>
                  <Row label='Valor do plano'>
                    {money(entry.breakdown.planCents)}
                  </Row>
                  <Row label='Taxa de processamento do cartão'>
                    {money(entry.breakdown.feeCents)}
                  </Row>
                  <Row
                    label='Total'
                    strong
                  >
                    {money(entry.amountCents)}
                  </Row>
                </>
              )}
              {entry.type !== 'CREDIT' && (
                <Row label='Forma de pagamento'>{paymentMethod(entry)}</Row>
              )}
              <Row label='Data e hora'>{dateTime(entry.createdAt)}</Row>
              {entry.transactionId && (
                <Row label='ID da transação'>
                  <button
                    type='button'
                    className='hover:text-foreground inline-flex max-w-full items-center gap-1.5 font-mono text-xs'
                    onClick={() => void copy(entry.transactionId!)}
                    aria-label={`Copiar ID da transação ${entry.transactionId}`}
                  >
                    <span className='truncate'>{entry.transactionId}</span>
                    <Copy className='size-3.5 shrink-0' />
                  </button>
                </Row>
              )}
            </dl>

            {entry.payment?.receiptUrl && (
              <div className='px-6 pb-6'>
                <Button
                  asChild
                  variant='outline'
                  className='w-full rounded-full'
                >
                  <a
                    href={entry.payment.receiptUrl}
                    target='_blank'
                    rel='noreferrer'
                  >
                    Ver comprovante
                    <ExternalLink className='size-4' />
                  </a>
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
