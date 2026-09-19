import type { IAuthStore, ISetUserAuth } from './auth-store.types';
import { create } from 'zustand';
import { toast } from 'sonner';
import { routes } from '@/shared/constants/router.constants';
import { authClient } from '@/app/modules/auth/client';

type AuthStateSnapshot = Omit<
  IAuthStore,
  | 'handleSetUserAuth'
  | 'handleSetAuthBootstrapStatus'
  | 'handleClearSession'
  | 'handleLogout'
>;

function buildBaseUnauthenticatedState(): AuthStateSnapshot {
  return {
    userAuthenticated: null,
    companyAuthenticated: null,
    authBootstrapStatus: 'unauthenticated',
  };
}

function buildInitialAuthState(): AuthStateSnapshot {
  return {
    ...buildBaseUnauthenticatedState(),
    authBootstrapStatus: 'idle',
  };
}

function buildSessionState({ auth }: ISetUserAuth): Partial<IAuthStore> {
  return {
    userAuthenticated: auth.user,
    companyAuthenticated: auth.company,
    authBootstrapStatus: 'ready',
  };
}

export const useAuthStore = create<IAuthStore>()((set) => ({
  ...buildInitialAuthState(),

  handleSetUserAuth: (data: ISetUserAuth) => {
    set(buildSessionState(data));
  },

  handleSetAuthBootstrapStatus: (status) => {
    set({ authBootstrapStatus: status });
  },

  handleClearSession: () => {
    set(buildBaseUnauthenticatedState());
  },

  handleLogout: async () => {
    await authClient.signOut().catch(() => undefined);
    set(buildBaseUnauthenticatedState());
    toast.info('Desconectado!');
    window.location.href = routes.login;
  },
}));
