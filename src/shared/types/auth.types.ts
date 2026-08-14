export type ITokenType = {
  id: string;
  companyId: string;
  iat: number;
  exp: number;
};

export interface IUserSession {
  id: string;
  name: string;
  email: string;
  company?: ICompanySummary;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ICompanySummary {
  id: string;
  name: string;
  email: string;
}

export interface ICompanySession {
  id: string;
  name: string;
  email: string;
  plan: {
    id: string;
    name: string;
    code: string;
    type: 'FREE' | 'AGENCY' | 'CUSTOM';
    maxClientPages: number;
    priceCents: number;
    active: boolean;
    analyticsEnabled: boolean;
    analyticsTier: 'BASIC' | 'FULL';
    customDomainEnabled: boolean;
    whiteLabelEnabled: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IAuthResponse {
  token: string;
  refreshToken: string;
}

export interface IAuthSessionResponse {
  user: IUserSession;
  company: ICompanySession;
}
