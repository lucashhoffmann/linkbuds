export const onlyDigits = (value: string) => value.replace(/\D/g, '');

export type CardBrand =
  'Visa' | 'Mastercard' | 'Amex' | 'Elo' | 'Hipercard' | 'Diners';

const ELO_PREFIX =
  /^(4011(78|79)|43(1274|8935)|45(1416|7393|763[12])|50(4175|6699|67[0-7]\d|9000)|627780|63(6297|6368)|650|6516|6550)/;

/** Best-effort brand from the first digits (display only; the gateway decides). */
export function cardBrand(number: string): CardBrand | null {
  const digits = onlyDigits(number);

  if (ELO_PREFIX.test(digits)) return 'Elo';
  if (/^(606282|3841)/.test(digits)) return 'Hipercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^3(0[0-5]|[68])/.test(digits)) return 'Diners';
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]|7[01]|720))/.test(digits)) return 'Mastercard';

  return null;
}

/** Groups of 4 (Amex: 4-6-5), max 19 digits. */
export function formatCardNumber(value: string) {
  const digits = onlyDigits(value).slice(0, 19);

  if (cardBrand(digits) === 'Amex') {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
      .filter(Boolean)
      .join(' ');
  }

  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function isValidCardNumber(value: string) {
  const digits = onlyDigits(value);

  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  for (let index = 0; index < digits.length; index += 1) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

/** "MMAA" typed → "MM/AA". */
export function formatExpiry(value: string) {
  const digits = onlyDigits(value).slice(0, 4);

  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
}

/** "MM/AA" → { month, year } when it is a real, not expired month. */
export function parseExpiry(value: string, now = new Date()) {
  const [month = '', shortYear = ''] = value.split('/');

  if (!/^(0[1-9]|1[0-2])$/.test(month) || !/^\d{2}$/.test(shortYear)) {
    return null;
  }

  const year = `20${shortYear}`;
  const firstDayAfter = new Date(Number(year), Number(month), 1);

  return firstDayAfter > now ? { month, year } : null;
}

export function formatCpfCnpj(value: string) {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);

  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
}

export const formatMoney = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    cents / 100,
  );
