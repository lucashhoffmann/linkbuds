import { describe, expect, it } from 'vitest';
import {
  publicLinkPageQueryOptions,
  publicPageUrl,
} from '../use-link-pages.use-case';

describe('publicLinkPageQueryOptions', () => {
  it('keeps public LinkPages warm without aggressive refetching', () => {
    expect(publicLinkPageQueryOptions).toEqual({
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    });
  });
});

describe('publicPageUrl', () => {
  const app = 'https://app.linkbuds.com.br';
  const agency = { type: 'AGENCY' as const, publicPath: 'agencia-x' };
  const client = { type: 'CLIENT' as const, publicPath: 'pizzaria' };
  const post = { type: 'POST' as const, publicPath: 'pizzaria/promo' };
  const active = { hostname: 'links.agencia.com', status: 'ACTIVE' as const };

  it('puts the agency page at the root of an active custom domain', () => {
    expect(publicPageUrl(active, agency, app)).toEqual({
      path: '/',
      url: 'https://links.agencia.com/',
    });
  });

  it('keeps client pages and posts under /p on the custom domain', () => {
    expect(publicPageUrl(active, client, app).url).toBe(
      'https://links.agencia.com/p/pizzaria',
    );
    expect(publicPageUrl(active, post, app).url).toBe(
      'https://links.agencia.com/p/pizzaria/promo',
    );
  });

  it('uses the app host and /p while the domain is not active', () => {
    const pending = {
      hostname: 'links.agencia.com',
      status: 'PENDING' as const,
    };

    expect(publicPageUrl(pending, agency, app)).toEqual({
      path: '/p/agencia-x',
      url: 'https://app.linkbuds.com.br/p/agencia-x',
    });
    expect(publicPageUrl(null, agency, app).path).toBe('/p/agencia-x');
  });
});
