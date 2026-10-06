import { describe, expect, it } from 'vitest';
import type { PublicLinkPage } from '@/app/modules/link-pages/types/link-pages.types';
import {
  trackThirdPartyClick,
  trackThirdPartyPageView,
} from '../public-link-page-tracking';

const page = {
  id: 'page-1',
  gtmContainerId: 'GTM-TEST1',
  ga4MeasurementId: 'G-TEST1',
  links: [{ id: 'link-1', label: 'Site', url: 'https://site.com' }],
  socialLinks: [],
  images: [],
  videos: [],
} as unknown as PublicLinkPage;

describe('public link page third-party tracking', () => {
  it('does nothing without IDs', () => {
    trackThirdPartyPageView({
      ...page,
      gtmContainerId: null,
      ga4MeasurementId: null,
    });

    expect(window.dataLayer).toBeUndefined();
    expect(document.querySelectorAll('script')).toHaveLength(0);
  });

  it('loads GTM + GA4 once and forwards page views and clicks', () => {
    trackThirdPartyPageView(page);
    trackThirdPartyPageView(page);
    trackThirdPartyClick(page, 'VERTICAL_LINK', 'link-1');

    const sources = [...document.querySelectorAll('script')].map((s) => s.src);
    expect(sources).toEqual([
      'https://www.googletagmanager.com/gtm.js?id=GTM-TEST1',
      'https://www.googletagmanager.com/gtag/js?id=G-TEST1',
    ]);
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: 'linkbuds_page_view' }),
    );
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'linkbuds_click',
        link_label: 'Site',
        link_url: 'https://site.com',
      }),
    );
  });
});
