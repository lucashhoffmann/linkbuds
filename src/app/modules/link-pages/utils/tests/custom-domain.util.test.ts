import { describe, expect, it } from 'vitest';
import { isCustomDomain } from '../custom-domain.util';

describe('isCustomDomain', () => {
  it('treats any host other than the app host as a customer domain', () => {
    expect(isCustomDomain('partnerships.email', 'linkbuds.com.br')).toBe(true);
    expect(isCustomDomain('linkbuds.com.br', 'linkbuds.com.br')).toBe(false);
    expect(isCustomDomain('LinkBuds.com.br', 'linkbuds.com.br')).toBe(false);
  });

  it('is never a customer domain without a configured app host (dev)', () => {
    expect(isCustomDomain('localhost', undefined)).toBe(false);
    expect(isCustomDomain('localhost', '')).toBe(false);
  });
});
