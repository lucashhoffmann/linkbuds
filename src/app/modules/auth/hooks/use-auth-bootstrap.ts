import { useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/app/store/auth-store/use-auth-store';
import { useGetSessionAuthUseCase } from '@/app/modules/auth/use-cases';

export function useAuthBootstrap() {
  const token = Cookies.get('access-token') as string | undefined;
  const [
    authBootstrapStatus,
    userAuthenticated,
    companyAuthenticated,
    handleSetUserAuth,
    handleSetAuthBootstrapStatus,
    handleClearSession,
  ] = useAuthStore(
    useShallow((state) => [
      state.authBootstrapStatus,
      state.userAuthenticated,
      state.companyAuthenticated,
      state.handleSetUserAuth,
      state.handleSetAuthBootstrapStatus,
      state.handleClearSession,
    ]),
  );

  const shouldBootstrap =
    Boolean(token) &&
    (authBootstrapStatus !== 'ready' ||
      !userAuthenticated ||
      !companyAuthenticated);

  const { cachedUserLogged, isLoadingUserLogged, errorUserLogged } =
    useGetSessionAuthUseCase({
      enabled: shouldBootstrap,
    });

  useEffect(() => {
    if (!token) {
      if (authBootstrapStatus !== 'unauthenticated') {
        handleClearSession();
      }
      return;
    }

    if (authBootstrapStatus === 'idle') {
      handleSetAuthBootstrapStatus('bootstrapping');
    }
  }, [
    authBootstrapStatus,
    handleClearSession,
    handleSetAuthBootstrapStatus,
    token,
  ]);

  useEffect(() => {
    if (!token || !shouldBootstrap) {
      return;
    }

    if (isLoadingUserLogged) {
      if (authBootstrapStatus !== 'bootstrapping') {
        handleSetAuthBootstrapStatus('bootstrapping');
      }
      return;
    }

    if (cachedUserLogged) {
      handleSetUserAuth({
        token,
        auth: cachedUserLogged,
      });
      return;
    }

    if (errorUserLogged) {
      handleClearSession();
    }
  }, [
    authBootstrapStatus,
    cachedUserLogged,
    errorUserLogged,
    handleClearSession,
    handleSetAuthBootstrapStatus,
    handleSetUserAuth,
    isLoadingUserLogged,
    shouldBootstrap,
    token,
  ]);

  return useMemo(
    () => ({
      status: token ? authBootstrapStatus : 'unauthenticated',
      hasToken: Boolean(token),
      isBootstrapping: Boolean(token) && authBootstrapStatus !== 'ready',
      isReady: !token || authBootstrapStatus === 'ready',
      hasResolvedSession:
        authBootstrapStatus === 'ready' &&
        Boolean(userAuthenticated) &&
        Boolean(companyAuthenticated),
    }),
    [
      authBootstrapStatus,
      companyAuthenticated,
      token,
      userAuthenticated,
    ],
  );
}
