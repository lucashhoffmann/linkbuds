import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/app/store/auth-store/use-auth-store';
import { useGetSessionAuthUseCase } from '@/app/modules/auth/use-cases';
import { authClient } from '../client';

export function useAuthBootstrap() {
  const { data: betterAuthSession, isPending: isPendingBetterAuthSession } =
    authClient.useSession();
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

  const isSameUser = userAuthenticated?.id === betterAuthSession?.user.id;
  const shouldBootstrap =
    Boolean(betterAuthSession?.user) &&
    (authBootstrapStatus !== 'ready' ||
      !userAuthenticated ||
      !companyAuthenticated ||
      !isSameUser);

  const { cachedUserLogged, isLoadingUserLogged, errorUserLogged } =
    useGetSessionAuthUseCase({
      enabled: shouldBootstrap && !isPendingBetterAuthSession,
    });

  useEffect(() => {
    if (isPendingBetterAuthSession) {
      if (authBootstrapStatus !== 'bootstrapping') {
        handleSetAuthBootstrapStatus('bootstrapping');
      }
      return;
    }

    if (!betterAuthSession?.user) {
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
    betterAuthSession,
    handleClearSession,
    handleSetAuthBootstrapStatus,
    isPendingBetterAuthSession,
  ]);

  useEffect(() => {
    if (!betterAuthSession?.user || !shouldBootstrap) {
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
        auth: cachedUserLogged,
      });
      return;
    }

    if (errorUserLogged) {
      void authClient.signOut();
      handleClearSession();
    }
  }, [
    authBootstrapStatus,
    betterAuthSession,
    cachedUserLogged,
    errorUserLogged,
    handleClearSession,
    handleSetAuthBootstrapStatus,
    handleSetUserAuth,
    isSameUser,
    isLoadingUserLogged,
    shouldBootstrap,
  ]);

  return useMemo(
    () => ({
      status: betterAuthSession?.user
        ? authBootstrapStatus
        : isPendingBetterAuthSession
          ? 'bootstrapping'
          : 'unauthenticated',
      hasToken: Boolean(betterAuthSession?.user),
      isBootstrapping:
        isPendingBetterAuthSession ||
        (Boolean(betterAuthSession?.user) && authBootstrapStatus !== 'ready'),
      isReady:
        (!betterAuthSession?.user && !isPendingBetterAuthSession) ||
        authBootstrapStatus === 'ready',
      hasResolvedSession:
        authBootstrapStatus === 'ready' &&
        Boolean(userAuthenticated) &&
        Boolean(companyAuthenticated),
    }),
    [
      authBootstrapStatus,
      betterAuthSession,
      companyAuthenticated,
      isPendingBetterAuthSession,
      userAuthenticated,
    ],
  );
}
