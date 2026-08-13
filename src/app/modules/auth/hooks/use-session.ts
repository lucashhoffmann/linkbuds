import Cookies from 'js-cookie';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/app/store/auth-store/use-auth-store';

export function useSession() {
  const token = Cookies.get('access-token') as string | undefined;

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
    authenticated: !!token,
    companyId: companyAuthenticated?.id,
    company: companyAuthenticated,
    userAuthenticated,
    handleLogout,
    authBootstrapStatus,
    isAuthReady: authBootstrapStatus === 'ready',
    isBootstrappingAuth: !!token && authBootstrapStatus !== 'ready',
  };
}
