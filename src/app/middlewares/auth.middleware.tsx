import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthBootstrap } from '@/app/modules/auth/hooks';
import { routes } from '@/shared/constants/router.constants';
import { FeaturePageSkeleton } from '@/resources/components/base';

export function AuthMiddleware() {
  const location = useLocation();
  const { isReady, status } = useAuthBootstrap();

  if (!isReady) {
    return <FeaturePageSkeleton />;
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to={routes.login}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
