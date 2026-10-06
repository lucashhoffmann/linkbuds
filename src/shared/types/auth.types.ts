export type UserRole = 'OWNER' | 'MEMBER';

export interface IUserSession {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  createdAt: string;
}

/** What the company can use: plan merged with an active special condition. */
export interface ICompanyEntitlements {
  planCode: string;
  maxClientPages: number;
  maxMembers: number;
  analyticsTier: 'BASIC' | 'FULL';
  customDomain: boolean;
  whiteLabel: boolean;
  custom: boolean;
}

export interface ICompanySession {
  id: string;
  name: string;
  email: string;
  plan: { code: string; name: string };
  entitlements: ICompanyEntitlements;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthResponse {
  ok: boolean;
}

export interface IAuthSessionResponse {
  user: IUserSession;
  company: ICompanySession;
}
