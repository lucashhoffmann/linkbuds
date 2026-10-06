import type {
  AnalyticsTargetType,
  PublicLinkPage,
} from '@/app/modules/link-pages/types/link-pages.types';

// Owner's own Google Tag Manager / GA4, loaded only on the public page.
// IDs are format-validated by the API before they reach this script URL.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const loadedIds = new Set<string>();

function loadScript(src: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function setup({ gtmContainerId, ga4MeasurementId }: PublicLinkPage) {
  window.dataLayer = window.dataLayer ?? [];

  if (gtmContainerId && !loadedIds.has(gtmContainerId)) {
    loadedIds.add(gtmContainerId);
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    loadScript(
      `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmContainerId)}`,
    );
  }

  if (ga4MeasurementId && !loadedIds.has(ga4MeasurementId)) {
    loadedIds.add(ga4MeasurementId);
    window.gtag =
      window.gtag ??
      function gtag() {
        // gtag.js only understands the `arguments` object, not an array.
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
    window.gtag('js', new Date());
    // Page views are sent by hand: the SPA navigates bio ↔ post without reloads.
    window.gtag('config', ga4MeasurementId, { send_page_view: false });
    loadScript(
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4MeasurementId)}`,
    );
  }
}

function send(page: PublicLinkPage, event: string, params: object) {
  if (page.gtmContainerId) {
    window.dataLayer?.push({ event: `linkbuds_${event}`, ...params });
  }

  if (page.ga4MeasurementId) {
    window.gtag?.(
      'event',
      event === 'page_view' ? event : `linkbuds_${event}`,
      {
        ...params,
        send_to: page.ga4MeasurementId,
      },
    );
  }
}

export function trackThirdPartyPageView(page: PublicLinkPage) {
  if (!page.gtmContainerId && !page.ga4MeasurementId) return;

  setup(page);
  send(page, 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname,
  });
}

function describeTarget(
  page: PublicLinkPage,
  targetType: AnalyticsTargetType,
  targetId: string,
) {
  if (targetType === 'SOCIAL_LINK') {
    const social = page.socialLinks.find((item) => item.id === targetId);
    return { link_label: social?.platform, link_url: social?.url };
  }

  if (targetType === 'IMAGE') {
    const image = page.images.find((item) => item.id === targetId);
    return { link_label: image?.altText, link_url: image?.targetUrl };
  }

  const link = page.links.find((item) => item.id === targetId);
  return { link_label: link?.label, link_url: link?.url };
}

export function trackThirdPartyClick(
  page: PublicLinkPage,
  targetType: AnalyticsTargetType,
  targetId: string,
) {
  if (!page.gtmContainerId && !page.ga4MeasurementId) return;

  send(page, 'click', {
    link_type: targetType,
    link_id: targetId,
    ...describeTarget(page, targetType, targetId),
  });
}
