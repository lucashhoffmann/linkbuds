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
  DomainSettingsPage,
  FooterSettingsPage,
  HistorySettingsPage,
  AccountSettingsPage,
  TeamPage,
  TermsPage,
  LinkPageEditPage,
  LinkPageNewPage,
  LinkPagesPage,
  PublicLinkPagePage,
} from '@/resources/pages';
import {
  DOMAIN_HOME_SLUG,
  isDomainHomeUnavailable,
} from '@/resources/pages/link-pages/public-link-page.page';
import { useSession } from '@/app/modules/auth/hooks';
import { isCustomDomain } from '@/app/modules/link-pages/utils/custom-domain.util';
import { useGetPublicLinkPageUseCase } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';

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

  // Customer domain (page active, or off → "unavailable"): never the app login.
  if (domainHome.data || isDomainHomeUnavailable(domainHome.error)) {
    return <PublicLinkPagePage slug={DOMAIN_HOME_SLUG} />;
  }

  return (
    <Navigate
      to={authenticated ? routes.home : routes.login}
      replace
    />
  );
}

/** Customer domains serve only the public pages; app routes go to `/`. */
function CustomDomainRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={routes.initial}
          element={<PublicLinkPagePage slug={DOMAIN_HOME_SLUG} />}
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
          path='*'
          element={
            <Navigate
              to={routes.initial}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export function Router() {
  if (isCustomDomain()) {
    return <CustomDomainRouter />;
  }

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
          element={<AuthPage view='register' />}
        />

        <Route
          path={routes.forgotPassword}
          element={<AuthPage view='forgotPassword' />}
        />

        <Route
          path={routes.resetPassword}
          element={<AuthPage view='resetPassword' />}
        />

        <Route
          path={routes.terms}
          element={<TermsPage />}
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
              path={routes.settingsHistory}
              element={<HistorySettingsPage />}
            />

            <Route
              path={routes.settingsDomain}
              element={<DomainSettingsPage />}
            />

            <Route
              path={routes.settingsFooter}
              element={<FooterSettingsPage />}
            />

            <Route
              path={routes.settingsAccount}
              element={<AccountSettingsPage />}
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
