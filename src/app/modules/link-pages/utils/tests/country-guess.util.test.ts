import { afterEach, describe, expect, it, vi } from 'vitest';
import { guessCountryCode } from '../country-guess.util';

function mockTimeZone(timeZone: string) {
  vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
    timeZone,
  } as Intl.ResolvedDateTimeFormatOptions);
}

describe('guessCountryCode', () => {
  afterEach(() => vi.restoreAllMocks());

  it('usa o fuso horário', () => {
    mockTimeZone('America/Sao_Paulo');
    expect(guessCountryCode()).toBe('BR');
  });

  it('aceita nome legado de fuso', () => {
    mockTimeZone('Asia/Calcutta');
    expect(guessCountryCode()).toBe('IN');
  });

  it('cai para a região do idioma quando o fuso não diz o país', () => {
    mockTimeZone('UTC');
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['pt-PT']);
    expect(guessCountryCode()).toBe('PT');
  });
});
