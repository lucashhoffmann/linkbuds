import { AxiosError } from 'axios';
import { type FormEvent, useRef, useState } from 'react';
import { useSession } from '@/app/modules/auth/hooks';
import type { IBillingQuote } from '@/app/modules/billing/types/billing.types';
import { useBillingMutations } from '@/app/modules/billing/use-cases/use-billing.use-case';
import {
  cardBrand,
  formatMoney,
  isValidCardNumber,
  onlyDigits,
  parseExpiry,
} from './payment-format.util';

interface IUseSubscribeDialogProps {
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

/** What the gateway expects for an address without a number. */
export const NO_NUMBER = 'S/N';

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

export function useSubscribeDialog({
  quote,
  onClose,
  onQuoteChanged,
}: IUseSubscribeDialogProps) {
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

  return {
    fields,
    errors,
    failure,
    done,
    installmentCount,
    setInstallmentCount,
    brand,
    yearly,
    busy,
    options,
    totalCents,
    split,
    set,
    inputProps,
    close,
    submit,
  };
}
