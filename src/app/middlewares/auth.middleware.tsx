import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthBootstrap, useSession } from '@/app/modules/auth/hooks';
import { routes } from '@/shared/constants/router.constants';
import { FeaturePageSkeleton } from '@/resources/components/base';

export function AuthMiddleware() {
  const location = useLocation();
  const { authenticated } = useSession();
  const { isReady } = useAuthBootstrap();

  if (!authenticated) {
    return (
      <Navigate
        to={routes.login}
        replace
        state={{ from: location }}
      />
    );
  }

  if (!isReady) {
    return <FeaturePageSkeleton />;
  }

  return <Outlet />;
}
