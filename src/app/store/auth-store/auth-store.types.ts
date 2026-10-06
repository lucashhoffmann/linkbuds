import type {
  IAuthSessionResponse,
  ICompanySession,
  IUserSession,
} from '@/shared/types/auth.types';

export interface ISetUserAuth {
  auth: IAuthSessionResponse;
}

export type AuthBootstrapStatus =
  'idle' | 'bootstrapping' | 'ready' | 'unauthenticated';

export interface IAuthStore {
  userAuthenticated: IUserSession | null;
  companyAuthenticated: ICompanySession | null;
  authBootstrapStatus: AuthBootstrapStatus;
  handleSetUserAuth: (data: ISetUserAuth) => void;
  handleSetAuthBootstrapStatus: (status: AuthBootstrapStatus) => void;
  handleClearSession: () => void;
  handleLogout: () => Promise<void>;
}
