import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import linkPagesService from '@/app/modules/link-pages/service/link-pages.service';
import { useGetPublicLinkPageUseCase } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import type {
  AnalyticsEventType,
  AnalyticsTargetType,
} from '@/app/modules/link-pages/types/link-pages.types';
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

function submitFormHandler(pageId: string, visitorId: string): SubmitFormFn {
  return async (answers, website) => {
    try {
      await linkPagesService.submitForm(pageId, {
        answers,
        visitorId,
        website,
      });
      return { ok: true };
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
  };
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

  if (isError || !data) {
    return (
      <main className='flex min-h-dvh items-center justify-center bg-slate-100 p-5'>
        <div className='rounded-md border bg-white p-5 text-center'>
          <h1 className='font-semibold'>LinkPage não encontrada</h1>
          <p className='mt-2 text-sm text-slate-600'>
            A página pode estar inativa ou o endereço não existe.
          </p>
        </div>
      </main>
    );
  }

  return (
    <LinkPageRenderer
      linkPage={data}
      onSubmitForm={submitFormHandler(data.id, visitorId)}
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
