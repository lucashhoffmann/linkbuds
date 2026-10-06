import { AxiosError } from 'axios';
import { CircleCheck, CreditCard, Loader2, LockKeyhole } from 'lucide-react';
import { type FormEvent, type ReactNode, useRef, useState } from 'react';
import { useSession } from '@/app/modules/auth/hooks';
import type { IBillingQuote } from '@/app/modules/billing/types/billing.types';
import { useBillingMutations } from '@/app/modules/billing/use-cases/use-billing.use-case';
import { Button } from '@/resources/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/resources/components/ui/dialog';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';
import { Select } from '@/resources/components/ui/select';
import {
  cardBrand,
  formatCardNumber,
  formatCep,
  formatCpfCnpj,
  formatExpiry,
  formatMoney,
  formatPhone,
  isValidCardNumber,
  onlyDigits,
  parseExpiry,
} from './payment-format.util';

interface ISubscribeDialogProps {
  quote: IBillingQuote | null;
  onClose: () => void;
  /** The server total changed (409): refresh the quote shown. */
  onQuoteChanged: () => void;
}

const EMPTY = {
  number: '',
  name: '',
  expiry: '',
  ccv: '',
  cpfCnpj: '',
  phone: '',
  postalCode: '',
  addressNumber: '',
};
type Fields = typeof EMPTY;

function validate(fields: Fields) {
  const errors: Partial<Record<keyof Fields, string>> = {};
  const document = onlyDigits(fields.cpfCnpj);

  if (!isValidCardNumber(fields.number)) errors.number = 'Número inválido';
  if (fields.name.trim().length < 3) errors.name = 'Informe o nome';
  if (!parseExpiry(fields.expiry)) errors.expiry = 'Validade inválida';
  if (!/^\d{3,4}$/.test(fields.ccv)) errors.ccv = 'CVV inválido';
  if (document.length !== 11 && document.length !== 14) {
    errors.cpfCnpj = 'CPF ou CNPJ inválido';
  }
  if (onlyDigits(fields.phone).length < 10) errors.phone = 'Celular inválido';
  if (onlyDigits(fields.postalCode).length !== 8) {
    errors.postalCode = 'CEP inválido';
  }
  if (!fields.addressNumber.trim()) errors.addressNumber = 'Informe o número';

  return errors;
}

function Field({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid content-start gap-1.5 ${className ?? ''}`}>
      <Label
        htmlFor={id}
        className='text-xs font-medium'
      >
        {label}
      </Label>
      {children}
      {error && (
        <span
          id={`${id}-error`}
          className='text-destructive text-xs'
        >
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Transparent checkout: the card is typed here and charged by our API, so the
 * payer never leaves the app. The total shown is the quote (fees included)
 * and the API refuses to charge anything else.
 */
export function SubscribeDialog({
  quote,
  onClose,
  onQuoteChanged,
}: ISubscribeDialogProps) {
  const { userAuthenticated } = useSession();
  const { subscribe } = useBillingMutations();
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>(
    {},
  );
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(1);
  // Kept across network retries so a lost response never charges twice;
  // renewed after any answer from the API.
  const idempotencyKey = useRef(crypto.randomUUID());
  const brand = cardBrand(fields.number);
  const yearly = quote?.billingCycle === 'YEARLY';
  const busy = subscribe.isPending;
  const options = quote?.installments ?? [];
  // Each split has its own card fee: the total follows the chosen option.
  const chosen = options.find((option) => option.count === installmentCount);
  const totalCents = chosen?.totalCents ?? quote?.totalCents ?? 0;
  const split =
    chosen && chosen.count > 1
      ? `${chosen.count}x de ${formatMoney(chosen.installmentCents)}`
      : null;

  const set =
    (
      name: keyof Fields,
      format: (value: string) => string = (value) => value,
    ) =>
    (event: { target: { value: string } }) => {
      setFields((current) => ({
        ...current,
        [name]: format(event.target.value),
      }));
      setErrors((current) => ({ ...current, [name]: undefined }));
    };

  const inputProps = (name: keyof Fields, id: string) => ({
    id,
    value: fields[name],
    error: Boolean(errors[name]),
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${id}-error` : undefined,
  });

  function close() {
    if (busy) return;
    setFields(EMPTY);
    setErrors({});
    setFailure(null);
    setDone(false);
    setInstallmentCount(1);
    onClose();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!quote || busy) return;

    const found = validate(fields);
    setErrors(found);
    setFailure(null);
    const expiry = parseExpiry(fields.expiry);
    if (Object.keys(found).length > 0 || !expiry) return;

    const name = fields.name.trim();

    subscribe.mutate(
      {
        idempotencyKey: idempotencyKey.current,
        input: {
          planCode: quote.planCode,
          billingCycle: quote.billingCycle,
          expectedTotalCents: totalCents,
          installmentCount: chosen?.count ?? 1,
          holder: {
            name,
            email: userAuthenticated?.email ?? '',
            cpfCnpj: onlyDigits(fields.cpfCnpj),
            phone: onlyDigits(fields.phone),
            postalCode: onlyDigits(fields.postalCode),
            addressNumber: fields.addressNumber.trim(),
          },
          card: {
            holderName: name,
            number: onlyDigits(fields.number),
            expiryMonth: expiry.month,
            expiryYear: expiry.year,
            ccv: fields.ccv,
          },
        },
      },
      {
        onSuccess: () => {
          idempotencyKey.current = crypto.randomUUID();
          setFields(EMPTY);
          setDone(true);
        },
        onError: (error) => {
          const response = error instanceof AxiosError ? error.response : null;
          const payload = response?.data as
            { errorCode?: string; message?: string } | undefined;

          if (response) idempotencyKey.current = crypto.randomUUID();
          if (payload?.errorCode === 'BILLING_QUOTE_CHANGED') onQuoteChanged();
          setFailure(
            payload?.message ??
              'Não foi possível concluir o pagamento. Tente novamente.',
          );
        },
      },
    );
  }

  return (
    <Dialog
      open={Boolean(quote)}
      onOpenChange={(open) => !open && close()}
    >
      <DialogContent
        showCloseButton={!busy}
        className='max-h-[calc(100dvh-1rem)] gap-0 overflow-y-auto p-0 sm:max-w-3xl'
        onInteractOutside={(event) => busy && event.preventDefault()}
        onEscapeKeyDown={(event) => busy && event.preventDefault()}
      >
        {quote && done && (
          <div className='grid justify-items-center gap-3 px-6 py-12 text-center'>
            <div className='bg-secondary text-primary flex size-14 items-center justify-center rounded-full'>
              <CircleCheck className='size-7' />
            </div>
            <DialogTitle className='text-xl'>Assinatura ativa</DialogTitle>
            <DialogDescription className='max-w-sm'>
              O plano {quote.planName} já está liberado na sua conta.
              {split
                ? ` Pago em ${split} no cartão; a renovação acontece daqui a um ano, nas mesmas condições.`
                : ` A próxima cobrança de ${formatMoney(totalCents)} acontece${yearly ? ' daqui a um ano' : ' daqui a um mês'}.`}
            </DialogDescription>
            <Button
              type='button'
              className='mt-2 rounded-full px-6'
              onClick={close}
            >
              Concluir
            </Button>
          </div>
        )}

        {quote && !done && (
          <div className='grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'>
            <aside className='bg-muted/70 flex flex-col gap-6 p-5 sm:p-6 md:rounded-l-lg'>
              <div className='grid gap-1 pr-8 md:pr-0'>
                <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                  Assinatura
                </p>
                <DialogTitle className='text-2xl font-semibold tracking-tight'>
                  Plano {quote.planName}
                </DialogTitle>
                <DialogDescription>
                  Cobrança {yearly ? 'anual' : 'mensal'} no cartão de crédito
                </DialogDescription>
              </div>

              <div className='bg-background grid gap-3 rounded-xl p-4 md:mt-auto'>
                <div className='flex items-baseline justify-between gap-3 text-sm'>
                  <span className='text-muted-foreground'>
                    {quote.planName} · {yearly ? '12 meses' : '1 mês'}
                  </span>
                  <span>{formatMoney(totalCents)}</span>
                </div>
                <div className='border-t pt-3'>
                  <div className='flex items-baseline justify-between gap-3'>
                    <span className='text-sm font-medium'>Total</span>
                    <span className='text-2xl font-semibold tracking-tight'>
                      {formatMoney(totalCents)}
                    </span>
                  </div>
                  {split && (
                    <p className='mt-0.5 text-right text-sm font-medium'>
                      em {split}
                    </p>
                  )}
                  <p className='text-muted-foreground mt-1 text-xs'>
                    Renova a cada {yearly ? 'ano' : 'mês'} pelo mesmo valor.
                    Cancele quando quiser.
                  </p>
                </div>
              </div>

              <p className='text-muted-foreground flex items-start gap-2 text-xs'>
                <LockKeyhole className='mt-px size-3.5 shrink-0' />
                Pagamento criptografado. Os dados do cartão não ficam salvos na
                LinkBuds.
              </p>
            </aside>

            <form
              noValidate
              className='grid content-start gap-5 p-5 sm:p-6'
              onSubmit={submit}
            >
              <fieldset
                disabled={busy}
                className='grid grid-cols-2 gap-3'
              >
                <legend className='mb-3 text-sm font-semibold'>Cartão</legend>
                <Field
                  id='card-number'
                  label='Número do cartão'
                  error={errors.number}
                  className='col-span-2'
                >
                  <div className='relative'>
                    <Input
                      {...inputProps('number', 'card-number')}
                      inputMode='numeric'
                      autoComplete='cc-number'
                      placeholder='0000 0000 0000 0000'
                      className='pr-28 tracking-wide'
                      onChange={set('number', formatCardNumber)}
                    />
                    <span className='text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium'>
                      {brand ?? <CreditCard className='size-4' />}
                    </span>
                  </div>
                </Field>
                <Field
                  id='card-name'
                  label='Nome do titular'
                  error={errors.name}
                  className='col-span-2'
                >
                  <Input
                    {...inputProps('name', 'card-name')}
                    autoComplete='cc-name'
                    placeholder='Como está no cartão'
                    onChange={set('name')}
                  />
                </Field>
                <Field
                  id='card-expiry'
                  label='Validade'
                  error={errors.expiry}
                >
                  <Input
                    {...inputProps('expiry', 'card-expiry')}
                    inputMode='numeric'
                    autoComplete='cc-exp'
                    placeholder='MM/AA'
                    onChange={set('expiry', formatExpiry)}
                  />
                </Field>
                <Field
                  id='card-ccv'
                  label='CVV'
                  error={errors.ccv}
                >
                  <Input
                    {...inputProps('ccv', 'card-ccv')}
                    inputMode='numeric'
                    autoComplete='cc-csc'
                    placeholder='123'
                    onChange={set('ccv', (value) =>
                      onlyDigits(value).slice(0, 4),
                    )}
                  />
                </Field>
                {yearly && options.length > 1 && (
                  <Field
                    id='card-installments'
                    label='Parcelas'
                    className='col-span-2'
                  >
                    <Select
                      id='card-installments'
                      aria-label='Parcelas'
                      value={String(installmentCount)}
                      onChange={(event) =>
                        setInstallmentCount(Number(event.target.value))
                      }
                    >
                      {options.map((option) => (
                        <option
                          key={option.count}
                          value={String(option.count)}
                        >
                          {option.count === 1
                            ? `À vista · ${formatMoney(option.totalCents)}`
                            : `${option.count}x de ${formatMoney(option.installmentCents)} · total ${formatMoney(option.totalCents)}`}
                        </option>
                      ))}
                    </Select>
                  </Field>
                )}
              </fieldset>

              <fieldset
                disabled={busy}
                className='grid grid-cols-2 gap-3'
              >
                <legend className='mb-3 text-sm font-semibold'>
                  Dados do titular
                </legend>
                <Field
                  id='holder-document'
                  label='CPF ou CNPJ'
                  error={errors.cpfCnpj}
                >
                  <Input
                    {...inputProps('cpfCnpj', 'holder-document')}
                    inputMode='numeric'
                    placeholder='000.000.000-00'
                    onChange={set('cpfCnpj', formatCpfCnpj)}
                  />
                </Field>
                <Field
                  id='holder-phone'
                  label='Celular'
                  error={errors.phone}
                >
                  <Input
                    {...inputProps('phone', 'holder-phone')}
                    inputMode='tel'
                    autoComplete='tel-national'
                    placeholder='(11) 90000-0000'
                    onChange={set('phone', formatPhone)}
                  />
                </Field>
                <Field
                  id='holder-cep'
                  label='CEP'
                  error={errors.postalCode}
                >
                  <Input
                    {...inputProps('postalCode', 'holder-cep')}
                    inputMode='numeric'
                    autoComplete='postal-code'
                    placeholder='00000-000'
                    onChange={set('postalCode', formatCep)}
                  />
                </Field>
                <Field
                  id='holder-number'
                  label='Número'
                  error={errors.addressNumber}
                >
                  <Input
                    {...inputProps('addressNumber', 'holder-number')}
                    placeholder='123'
                    onChange={set('addressNumber', (value) =>
                      value.slice(0, 10),
                    )}
                  />
                </Field>
              </fieldset>

              {failure && (
                <p
                  role='alert'
                  className='border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-3 py-2 text-sm'
                >
                  {failure}
                </p>
              )}

              <div className='grid gap-2'>
                <Button
                  type='submit'
                  size='lg'
                  className='h-12 rounded-full text-base'
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className='size-4 animate-spin' />
                      Processando pagamento…
                    </>
                  ) : (
                    <>
                      <LockKeyhole className='size-4' />
                      {split
                        ? `Pagar ${split}`
                        : `Pagar ${formatMoney(totalCents)}`}
                    </>
                  )}
                </Button>
                <p className='text-muted-foreground text-center text-xs'>
                  Ao assinar, você autoriza a cobrança de{' '}
                  {formatMoney(totalCents)}
                  {split ? ` (${split})` : ''} por {yearly ? 'ano' : 'mês'} até
                  cancelar.
                </p>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
