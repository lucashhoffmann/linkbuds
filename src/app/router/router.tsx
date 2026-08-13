import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import { AuthMiddleware } from '@/app/middlewares/auth.middleware';
import { AppLayout } from '@/layouts/app-layout/app-layout';
import { routes } from '@/shared/constants/router.constants';
import {
  AuthPage,
  ErrorBrokenPage,
  ErrorInternalPage,
  ErrorNotFoundPage,
  HomePage,
} from '@/resources/pages';
import { useSession } from '@/app/modules/auth/hooks';

function InitialRedirect() {
  const { authenticated } = useSession();

  return (
    <Navigate
      to={authenticated ? routes.home : routes.login}
      replace
    />
  );
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={routes.initial}
          element={<InitialRedirect />}
        />

        <Route
          path={routes.login}
          element={<AuthPage />}
        />

        <Route
          path={routes.register}
          element={<AuthPage register />}
        />

        <Route
          path={routes.errors.broken}
          element={<ErrorBrokenPage />}
        />

        <Route
          path={routes.errors.internal}
          element={<ErrorInternalPage />}
        />

        <Route element={<AuthMiddleware />}>
          <Route
            element={
              <AppLayout>
                <Outlet />
              </AppLayout>
            }
          >
            <Route
              path={routes.home}
              element={<HomePage />}
            />
          </Route>
        </Route>

        <Route
          path='*'
          element={<ErrorNotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}
