import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Action, AuthorizationSubject } from '../types/authorization.types';
import { useCan } from './use-ability';

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
}));

vi.mock('@/app/modules/auth/hooks', () => ({
  useSession: mocks.useSession,
}));

describe('useCan', () => {
  beforeEach(() => {
    mocks.useSession.mockReturnValue({
      companyId: 'company-id',
      company: {
        id: 'company-id',
        plan: {
          type: 'FREE',
          customDomainEnabled: false,
          whiteLabelEnabled: false,
        },
      },
    });
  });

  it('allows free plans to manage custom domains without enabling white-label', () => {
    const customDomain = renderHook(() =>
      useCan(Action.ManageCustomDomain, AuthorizationSubject.CompanyDomain),
    );
    const whiteLabel = renderHook(() =>
      useCan(Action.ManageWhiteLabel, AuthorizationSubject.LinkPageWhiteLabel),
    );

    expect(customDomain.result.current).toBe(true);
    expect(whiteLabel.result.current).toBe(false);
  });
});
