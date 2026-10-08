import { isAxiosError } from 'axios';
import { Asterisk } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Navigate, Link as RouterLink, useParams } from 'react-router-dom';
import linkPagesService from '@/app/modules/link-pages/service/link-pages.service';
import { isCustomDomain } from '@/app/modules/link-pages/utils/custom-domain.util';
import { useGetPublicLinkPageUseCase } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import type {
  AnalyticsEventType,
  AnalyticsTargetType,
} from '@/app/modules/link-pages/types/link-pages.types';
import { Swap } from '@/resources/pages/home/components/agency-promo-dialog.component';
import { routes } from '@/shared/constants/router.constants';
import { PublicLinkPageLoader } from './components/public-link-page-loader.component';
import {
  trackThirdPartyClick,
  trackThirdPartyPageView,
} from './hooks/public-link-page-tracking';
import { usePublicLinkPageSeo } from './hooks/use-public-link-page-seo';
import { LinkPageRenderer } from './renderer/link-page-renderer.component';
import type { SubmitFormFn } from './renderer/link-page-renderer-parts';

const visitorStorageKey = 'linkbuds_public_visitor_id';
const sessionStorageKey = 'linkbuds_public_session_id';
const presenceIntervalMs = 30000;

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getVisitorId() {
  if (typeof window === 'undefined') return createId('visitor');

  const existing = window.localStorage.getItem(visitorStorageKey);
  if (existing) return existing;

  const visitorId = createId('visitor');
  window.localStorage.setItem(visitorStorageKey, visitorId);

  return visitorId;
}

function getSessionId() {
  if (typeof window === 'undefined') return createId('session');

  const existing = window.sessionStorage.getItem(sessionStorageKey);
  if (existing) return existing;

  const sessionId = createId('session');
  window.sessionStorage.setItem(sessionStorageKey, sessionId);

  return sessionId;
}

function eventTypeFromTarget(
  targetType: AnalyticsTargetType,
): AnalyticsEventType {
  if (targetType === 'SOCIAL_LINK') return 'SOCIAL_CLICK';
  if (targetType === 'IMAGE') return 'IMAGE_CLICK';

  return 'LINK_CLICK';
}

function getUtmParams() {
  if (typeof window === 'undefined') {
    return {};
  }

  const params = new URLSearchParams(window.location.search);

  return {
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
    utmContent: params.get('utm_content'),
    utmTerm: params.get('utm_term'),
  };
}

async function submitForm(
  pageId: string,
  visitorId: string,
  /** When the visitor started filling the form (null = unknown). */
  started: number | null,
  ...[answers, website]: Parameters<SubmitFormFn>
): ReturnType<SubmitFormFn> {
  try {
    const { score } = await linkPagesService.submitForm(pageId, {
      answers,
      visitorId,
      website,
      durationMs: started === null ? null : Date.now() - started,
    });
    return { ok: true, score };
  } catch (error) {
    const data = isAxiosError<{
      message?: string;
      errors?: Array<{ path?: string }>;
    }>(error)
      ? error.response?.data
      : undefined;

    return {
      ok: false,
      message: data?.message ?? 'Não foi possível enviar. Tente de novo.',
      invalid: (data?.errors ?? []).flatMap((issue) => issue.path ?? []),
    };
  }
}

// API slug for "the agency page of this custom domain".
export const DOMAIN_HOME_SLUG = '_home';

/** `_home` failed because the agency page is off: still a customer domain. */
export function isDomainHomeUnavailable(error: unknown) {
  return (
    isAxiosError<{ errorCode?: string }>(error) &&
    error.response?.data?.errorCode === 'LINK_PAGE_DOMAIN_HOME_UNAVAILABLE'
  );
}

/** `slug` overrides the route param (custom-domain root uses `_home`). */
export function PublicLinkPagePage({ slug: slugProp }: { slug?: string } = {}) {
  const params = useParams();
  // Post sub-pages resolve as `bio/post` (same API path shape).
  const slug =
    slugProp ??
    (params.postSlug ? `${params.slug}/${params.postSlug}` : params.slug);
  const startedAtRef = useRef<number | null>(null);
  const exitSentRef = useRef(false);
  const [visitorId] = useState(() => getVisitorId());
  const [sessionId] = useState(() => getSessionId());
  const { data, isError, isLoading } = useGetPublicLinkPageUseCase(slug);
  // On a custom domain the agency page lives at `/`, not `/p/:slug`.
  const onCustomDomain = isCustomDomain();
  const isBioRoute = !slugProp && !params.postSlug;
  const domainHome = useGetPublicLinkPageUseCase(
    onCustomDomain && isBioRoute && data ? DOMAIN_HOME_SLUG : undefined,
  );
  usePublicLinkPageSeo(data, isError || (!isLoading && !data));

  useEffect(() => {
    if (!data) return;

    startedAtRef.current = Date.now();
    exitSentRef.current = false;
    const utmParams = getUtmParams();
    void linkPagesService.trackEvent(data.id, {
      // Deterministic: reloads/remounts in the same tab on the same day dedupe server-side.
      eventId: `view_${data.id}_${sessionId}_${new Date().toISOString().slice(0, 10)}`,
      eventType: 'PAGE_VIEW',
      visitorId,
      sessionId,
      referrer: document.referrer || null,
      ...utmParams,
      metadata: {
        path: window.location.pathname,
        hostname: window.location.host,
      },
    });
    trackThirdPartyPageView(data);
    void linkPagesService.trackPresence(data.id, sessionId);

    const presenceInterval = window.setInterval(() => {
      void linkPagesService.trackPresence(data.id, sessionId);
    }, presenceIntervalMs);

    const sendExit = () => {
      if (exitSentRef.current) return;

      exitSentRef.current = true;
      const startedAt = startedAtRef.current ?? Date.now();
      linkPagesService.trackEventBeacon(data.id, {
        eventId: createId('event'),
        eventType: 'PAGE_EXIT',
        visitorId,
        sessionId,
        durationMs: Date.now() - startedAt,
        referrer: document.referrer || null,
        ...utmParams,
      });
    };

    window.addEventListener('pagehide', sendExit);

    return () => {
      sendExit();
      window.clearInterval(presenceInterval);
      window.removeEventListener('pagehide', sendExit);
    };
  }, [data?.id, sessionId, visitorId]);

  if (isLoading) {
    return <PublicLinkPageLoader />;
  }

  if (data && domainHome.data?.id === data.id) {
    return (
      <Navigate
        to={`/${window.location.search}`}
        replace
      />
    );
  }

  if (isError || !data) {
    return (
      <main className='flex min-h-dvh items-center justify-center bg-slate-100 p-5'>
        <div className='w-full max-w-sm rounded-xl border bg-white p-6 text-center shadow-sm'>
          <h1 className='font-semibold'>LinkBud não encontrado</h1>
          <p className='mt-2 text-sm text-slate-600'>
            A página pode estar inativa ou o endereço não existe.
          </p>
          {/* The visitor is on the agency's domain: no LinkBuds sign-up pitch. */}
          {!onCustomDomain && (
            <div className='mt-6 grid gap-3 border-t pt-6'>
              <span className='mx-auto flex items-center gap-1.5 text-sm font-semibold'>
                <Asterisk className='size-4' />
                LinkBuds
              </span>
              <p className='text-sm text-slate-600'>
                Crie a sua página de links em minutos, com a cara da sua marca.
              </p>
              <span className='mx-auto flex max-w-full items-center rounded-full px-3 py-1 text-xs ring-1 ring-slate-300'>
                <Swap
                  from='linkbuds.com/p/sua-marca'
                  to='links.suamarca.com.br'
                />
              </span>
              <RouterLink
                to={routes.register}
                className='rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800'
              >
                Criar meu LinkBud
              </RouterLink>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <LinkPageRenderer
      linkPage={data}
      onSubmitForm={(answers, website) =>
        submitForm(data.id, visitorId, startedAtRef.current, answers, website)
      }
      onTrack={(targetType, targetId) => {
        linkPagesService.trackEventBeacon(data.id, {
          eventId: createId('event'),
          eventType: eventTypeFromTarget(targetType),
          targetType,
          targetId,
          visitorId,
          sessionId,
          referrer: document.referrer || null,
          ...getUtmParams(),
        });
        trackThirdPartyClick(data, targetType, targetId);
      }}
    />
  );
}
