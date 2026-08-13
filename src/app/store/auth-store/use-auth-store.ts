import type { IAuthStore, ISetUserAuth } from './auth-store.types';
import { create } from 'zustand';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { env } from '@/app/config/env.config';
import { toast } from 'sonner';
import type { ITokenType } from '@/shared/types/auth.types';
import { routes } from '@/shared/constants/router.constants';

type AuthStateSnapshot = Omit<
  IAuthStore,
  | 'handleSetUserAuth'
  | 'handleSetAuthBootstrapStatus'
  | 'handleClearSession'
  | 'handleLogout'
>;

function getCookieDomain() {
  if (env.ENV === 'prod') {
    return env.COOKIE_DOMAIN || undefined;
  }

  return env.COOKIE_LOCAL || undefined;
}

function getCookieOptions(expires?: Date) {
  const domain = getCookieDomain();

  return {
    expires,
    path: '/',
    ...(domain ? { domain } : {}),
  };
}

function decodeAuthToken(token: string) {
  try {
    return jwtDecode<ITokenType>(token);
  } catch {
    return null;
  }
}

function buildBaseUnauthenticatedState(): AuthStateSnapshot {
  return {
    userAuthenticated: null,
    companyAuthenticated: null,
    expiresIn: null,
    authBootstrapStatus: 'unauthenticated',
  };
}

function buildInitialAuthState(): AuthStateSnapshot {
  const token = Cookies.get('access-token');
  if (!token) {
    return buildBaseUnauthenticatedState();
  }

  const decoded = decodeAuthToken(token);
  if (!decoded) {
    Cookies.remove('access-token', getCookieOptions());
    return buildBaseUnauthenticatedState();
  }

  return {
    ...buildBaseUnauthenticatedState(),
    expiresIn: decoded.exp,
    authBootstrapStatus: 'idle',
  };
}

function buildSessionStateFromToken({
  token,
  auth,
}: ISetUserAuth): Partial<IAuthStore> | null {
  const decoded = decodeAuthToken(token);
  if (!decoded) return null;

  return {
    userAuthenticated: auth?.user ?? null,
    companyAuthenticated: auth?.company ?? null,
    expiresIn: decoded.exp,
    authBootstrapStatus: auth ? 'ready' : 'bootstrapping',
  };
}

export const useAuthStore = create<IAuthStore>()((set) => ({
  ...buildInitialAuthState(),

  handleSetUserAuth: (data: ISetUserAuth) => {
    const { token } = data;
    if (!token) return;

    const decoded = decodeAuthToken(token);
    if (!decoded) return;

    Cookies.set(
      'access-token',
      token,
      getCookieOptions(new Date(decoded.exp * 1000)),
    );

    const nextState = buildSessionStateFromToken(data);
    if (!nextState) return;

    set(nextState);
  },

  handleSetAuthBootstrapStatus: (status) => {
    set({ authBootstrapStatus: status });
  },

  handleClearSession: () => {
    Cookies.remove('access-token', getCookieOptions());
    set(buildBaseUnauthenticatedState());
  },

  handleLogout: () => {
    Cookies.remove('access-token', getCookieOptions());
    set(buildBaseUnauthenticatedState());
    toast.info('Desconectado!');
    window.location.href = routes.login;
  },
}));
