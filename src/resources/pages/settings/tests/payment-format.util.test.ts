import { describe, expect, it } from 'vitest';
import {
  cardBrand,
  formatCardNumber,
  formatCpfCnpj,
  formatExpiry,
  isValidCardNumber,
  parseExpiry,
} from '../components/subscribe-dialog/payment-format.util';

describe('payment format', () => {
  it('detects brands and groups digits (Amex 4-6-5)', () => {
    expect(cardBrand('5162 3062')).toBe('Mastercard');
    expect(cardBrand('4111')).toBe('Visa');
    expect(cardBrand('6363 68')).toBe('Elo');
    expect(formatCardNumber('5162306219378829')).toBe('5162 3062 1937 8829');
    expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005');
  });

  it('validates card numbers with Luhn', () => {
    expect(isValidCardNumber('5162 3062 1937 8829')).toBe(true);
    expect(isValidCardNumber('5162 3062 1937 8820')).toBe(false);
    expect(isValidCardNumber('4242')).toBe(false);
  });

  it('parses expiry and rejects past months', () => {
    const now = new Date(2026, 9, 6);
    expect(formatExpiry('0530')).toBe('05/30');
    expect(parseExpiry('05/30', now)).toEqual({ month: '05', year: '2030' });
    expect(parseExpiry('10/26', now)).toEqual({ month: '10', year: '2026' });
    expect(parseExpiry('09/26', now)).toBeNull();
    expect(parseExpiry('13/30', now)).toBeNull();
  });

  it('masks CPF and CNPJ', () => {
    expect(formatCpfCnpj('24971563792')).toBe('249.715.637-92');
    expect(formatCpfCnpj('11222333000181')).toBe('11.222.333/0001-81');
  });
});
