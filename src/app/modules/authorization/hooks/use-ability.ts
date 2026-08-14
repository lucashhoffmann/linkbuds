import { AbilityBuilder, createMongoAbility, subject } from '@casl/ability';
import { useMemo } from 'react';
import { useSession } from '@/app/modules/auth/hooks';
import { Action, AuthorizationSubject } from '../types/authorization.types';

export function useAbility() {
  const { company } = useSession();

  return useMemo(() => {
    const { can, build } = new AbilityBuilder(createMongoAbility);
    const companyId = company?.id;

    if (companyId) {
      can(
        [Action.Manage, Action.Create, Action.Read, Action.Update, Action.Delete],
        AuthorizationSubject.LinkPage,
        { companyId },
      );
    }

    if (
      companyId &&
      (company?.plan?.analyticsEnabled || company?.plan?.analyticsTier)
    ) {
      can(Action.ViewAnalytics, AuthorizationSubject.LinkPageAnalytics, {
        companyId,
      });
    }

    if (
      companyId &&
      (company?.plan?.customDomainEnabled ||
        company?.plan?.type === 'FREE' ||
        company?.plan?.type === 'AGENCY' ||
        company?.plan?.type === 'CUSTOM')
    ) {
      can(Action.ManageCustomDomain, AuthorizationSubject.CompanyDomain, {
        companyId,
      });
    }

    if (companyId && company?.plan?.whiteLabelEnabled) {
      can(Action.ManageWhiteLabel, AuthorizationSubject.LinkPageWhiteLabel, {
        companyId,
      });
    }

    return build();
  }, [company?.id, company?.plan]);
}

export function useCan(
  action: Action,
  authorizationSubject: AuthorizationSubject,
) {
  const ability = useAbility();
  const { companyId } = useSession();

  return ability.can(
    action,
    subject(authorizationSubject, { companyId: companyId ?? null }),
  );
}
