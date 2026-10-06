export interface IAuthPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  /** Joins the inviting company instead of creating one. */
  inviteToken?: string;
}

export interface IUseGetSessionAuthProps {
  enabled: boolean;
}
