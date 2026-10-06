import { describe, expect, it } from 'vitest';
import { publicLinkPageQueryOptions } from '../use-link-pages.use-case';

describe('publicLinkPageQueryOptions', () => {
  it('keeps public LinkPages warm without aggressive refetching', () => {
    expect(publicLinkPageQueryOptions).toEqual({
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    });
  });
});
