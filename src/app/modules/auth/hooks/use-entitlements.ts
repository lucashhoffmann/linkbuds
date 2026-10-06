import type { ICompanyEntitlements } from '@/shared/types/auth.types';
import { useSession } from './use-session';

const NO_ENTITLEMENTS: ICompanyEntitlements = {
  planCode: '',
  maxClientPages: 0,
  maxMembers: 1,
  maxForms: 0,
  analyticsTier: 'BASIC',
  custom: false,
  customDomain: false,
  whiteLabel: false,
};

/** What the account's plan unlocks, as computed by the API. */
export function useEntitlements(): ICompanyEntitlements {
  return useSession().company?.entitlements ?? NO_ENTITLEMENTS;
}
