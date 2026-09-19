import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/app/store/auth-store/use-auth-store';
import { authClient } from '../client';

export function useSession() {
  const { data: betterAuthSession, isPending } = authClient.useSession();

  const [
    userAuthenticated,
    companyAuthenticated,
    handleLogout,
    authBootstrapStatus,
  ] = useAuthStore(
    useShallow((state) => [
      state.userAuthenticated,
      state.companyAuthenticated,
      state.handleLogout,
      state.authBootstrapStatus,
    ]),
  );

  return {
    authenticated: !!betterAuthSession?.user,
    companyId: companyAuthenticated?.id,
    company: companyAuthenticated,
    userAuthenticated,
    handleLogout,
    authBootstrapStatus,
    isAuthReady: authBootstrapStatus === 'ready',
    isBootstrappingAuth: isPending || authBootstrapStatus === 'bootstrapping',
  };
}
