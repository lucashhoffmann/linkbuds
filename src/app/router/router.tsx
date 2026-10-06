import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import { AuthMiddleware } from '@/app/middlewares/auth.middleware';
import { StudioShell } from '@/resources/components/base/studio-shell/studio-shell';
import { routes } from '@/shared/constants/router.constants';
import {
  AuthPage,
  ErrorBrokenPage,
  ErrorInternalPage,
  ErrorNotFoundPage,
  HomePage,
  InvitePage,
  SettingsPage,
  TeamPage,
  LinkPageEditPage,
  LinkPageNewPage,
  LinkPagesPage,
  PublicLinkPagePage,
} from '@/resources/pages';
import { useSession } from '@/app/modules/auth/hooks';
import { useGetPublicLinkPageUseCase } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';

// API slug for "the agency page of this custom domain".
const DOMAIN_HOME_SLUG = '_home';

/**
 * `/` on a custom domain shows the agency page; on the app host it redirects.
 * ponytail: costs one 404 request on the app host; skip it via env when that matters.
 */
function InitialRedirect() {
  const { authenticated } = useSession();
  const domainHome = useGetPublicLinkPageUseCase(DOMAIN_HOME_SLUG);

  if (domainHome.isLoading) {
    return null;
  }

  if (domainHome.data) {
    return <PublicLinkPagePage slug={DOMAIN_HOME_SLUG} />;
  }

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
          path={routes.invite()}
          element={<InvitePage />}
        />

        <Route
          path={routes.publicLinkPage()}
          element={<PublicLinkPagePage />}
        />

        <Route
          path={routes.publicPostPage}
          element={<PublicLinkPagePage />}
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
              <StudioShell>
                <Outlet />
              </StudioShell>
            }
          >
            <Route
              path={routes.home}
              element={<HomePage />}
            />

            <Route
              path={routes.settings}
              element={<SettingsPage />}
            />

            <Route
              path={routes.team}
              element={<TeamPage />}
            />

            <Route
              path={routes.linkPages.list}
              element={<LinkPagesPage />}
            />

            <Route
              path={routes.linkPages.new}
              element={<LinkPageNewPage />}
            />

            <Route
              path={routes.linkPages.edit()}
              element={<LinkPageEditPage />}
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
