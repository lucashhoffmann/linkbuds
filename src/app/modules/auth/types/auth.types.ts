export interface IAuthPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  companyName?: string;
}

export interface IUseGetSessionAuthProps {
  enabled: boolean;
}
