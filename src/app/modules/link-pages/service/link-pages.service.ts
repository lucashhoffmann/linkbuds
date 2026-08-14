import { Http, HttpAuth } from '@/app/api/api';
import type {
  AnalyticsEventType,
  AnalyticsTargetType,
  CompanyDomain,
  LinkPageAnalyticsInsights,
  LinkPageAnalyticsSummary,
  LinkPageDetail,
  LinkPageImage,
  LinkPageLink,
  LinkPageLinkClicksResponse,
  LinkPagesListResponse,
  LinkPageSocialLink,
  PublicLinkPage,
} from '../types/link-pages.types';

type ApiResponse<T> = {
  data: T;
};

type TrackEventPayload = {
  eventId?: string | null;
  eventType: AnalyticsEventType;
  targetType?: AnalyticsTargetType | null;
  targetId?: string | null;
  visitorId?: string | null;
  sessionId?: string | null;
  durationMs?: number | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  metadata?: Record<string, unknown> | null;
};

class LinkPagesService {
  async list(): Promise<LinkPagesListResponse> {
    const { data } = await HttpAuth.get<ApiResponse<LinkPagesListResponse>>(
      '/link-pages',
    );
    return data.data;
  }

  async get(id: string): Promise<LinkPageDetail> {
    const { data } = await HttpAuth.get<ApiResponse<LinkPageDetail>>(
      `/link-pages/${id}`,
    );
    return data.data;
  }

  async create(payload: {
    name: string;
    slug: string;
    layout: string;
    title?: string;
  }): Promise<LinkPageDetail> {
    const { data } = await HttpAuth.post<ApiResponse<LinkPageDetail>>(
      '/link-pages',
      payload,
    );
    return data.data;
  }

  async update(id: string, payload: Partial<LinkPageDetail>) {
    const { data } = await HttpAuth.patch<ApiResponse<LinkPageDetail>>(
      `/link-pages/${id}`,
      payload,
    );
    return data.data;
  }

  async delete(id: string) {
    await HttpAuth.delete(`/link-pages/${id}`);
  }

  async updateFooter(id: string, payload: Partial<LinkPageDetail>) {
    const { data } = await HttpAuth.patch<ApiResponse<LinkPageDetail>>(
      `/link-pages/${id}/footer`,
      payload,
    );
    return data.data;
  }

  async createLink(id: string, payload: Omit<LinkPageLink, 'id'>) {
    const { data } = await HttpAuth.post<ApiResponse<LinkPageLink>>(
      `/link-pages/${id}/links`,
      payload,
    );
    return data.data;
  }

  async updateLink(id: string, linkId: string, payload: Partial<LinkPageLink>) {
    const { data } = await HttpAuth.patch<ApiResponse<LinkPageLink>>(
      `/link-pages/${id}/links/${linkId}`,
      payload,
    );
    return data.data;
  }

  async deleteLink(id: string, linkId: string) {
    await HttpAuth.delete(`/link-pages/${id}/links/${linkId}`);
  }

  async reorderLinks(id: string, payload: Array<{ id: string; sortOrder: number }>) {
    await HttpAuth.patch(`/link-pages/${id}/links/reorder`, payload);
  }

  async createSocialLink(id: string, payload: Omit<LinkPageSocialLink, 'id'>) {
    const { data } = await HttpAuth.post<ApiResponse<LinkPageSocialLink>>(
      `/link-pages/${id}/social-links`,
      payload,
    );
    return data.data;
  }

  async updateSocialLink(
    id: string,
    socialLinkId: string,
    payload: Partial<LinkPageSocialLink>,
  ) {
    const { data } = await HttpAuth.patch<ApiResponse<LinkPageSocialLink>>(
      `/link-pages/${id}/social-links/${socialLinkId}`,
      payload,
    );
    return data.data;
  }

  async deleteSocialLink(id: string, socialLinkId: string) {
    await HttpAuth.delete(`/link-pages/${id}/social-links/${socialLinkId}`);
  }

  async createImage(id: string, payload: Omit<LinkPageImage, 'id'>) {
    const { data } = await HttpAuth.post<ApiResponse<LinkPageImage>>(
      `/link-pages/${id}/images`,
      payload,
    );
    return data.data;
  }

  async updateImage(id: string, imageId: string, payload: Partial<LinkPageImage>) {
    const { data } = await HttpAuth.patch<ApiResponse<LinkPageImage>>(
      `/link-pages/${id}/images/${imageId}`,
      payload,
    );
    return data.data;
  }

  async deleteImage(id: string, imageId: string) {
    await HttpAuth.delete(`/link-pages/${id}/images/${imageId}`);
  }

  async analyticsSummary(id: string): Promise<LinkPageAnalyticsSummary> {
    const { data } = await HttpAuth.get<ApiResponse<LinkPageAnalyticsSummary>>(
      `/link-pages/${id}/analytics/summary`,
    );
    return data.data;
  }

  async analyticsInsights(
    id: string,
    params?: { from?: string; to?: string },
  ): Promise<LinkPageAnalyticsInsights> {
    const searchParams = new URLSearchParams();

    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);

    const query = searchParams.toString();
    const { data } = await HttpAuth.get<ApiResponse<LinkPageAnalyticsInsights>>(
      `/link-pages/${id}/analytics/insights${query ? `?${query}` : ''}`,
    );

    return data.data;
  }

  async analyticsLinkClicks(id: string): Promise<LinkPageLinkClicksResponse> {
    const { data } = await HttpAuth.get<ApiResponse<LinkPageLinkClicksResponse>>(
      `/link-pages/${id}/analytics/link-clicks`,
    );

    return data.data;
  }

  async getDomain(): Promise<CompanyDomain | null> {
    const { data } = await HttpAuth.get<ApiResponse<CompanyDomain | null>>(
      '/company/domain',
    );
    return data.data;
  }

  async createDomain(hostname: string): Promise<CompanyDomain> {
    const { data } = await HttpAuth.post<ApiResponse<CompanyDomain>>(
      '/company/domain',
      { hostname },
    );
    return data.data;
  }

  async verifyDomain(id: string): Promise<CompanyDomain> {
    const { data } = await HttpAuth.post<ApiResponse<CompanyDomain>>(
      `/company/domain/${id}/verify`,
    );
    return data.data;
  }

  async deleteDomain(id: string) {
    await HttpAuth.delete(`/company/domain/${id}`);
  }

  private getCurrentHostname() {
    if (typeof window === 'undefined') return undefined;

    return window.location.host;
  }

  async getPublic(slug: string): Promise<PublicLinkPage> {
    const { data } = await Http.get<ApiResponse<PublicLinkPage>>(
      `/public/link-pages/${slug}`,
      {
        headers: {
          'x-linkbuds-host': this.getCurrentHostname(),
        },
      },
    );
    return data.data;
  }

  async trackEvent(
    id: string,
    payload: TrackEventPayload,
  ) {
    await Http.post(`/public/link-pages/${id}/events`, payload);
  }

  trackEventBeacon(id: string, payload: TrackEventPayload) {
    const baseUrl = String(Http.defaults.baseURL ?? '').replace(/\/$/, '');
    const url = `${baseUrl}/public/link-pages/${id}/events`;
    const body = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      return navigator.sendBeacon(url, body);
    }

    if (typeof fetch !== 'undefined') {
      void fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        keepalive: true,
      });

      return true;
    }

    void this.trackEvent(id, payload);

    return false;
  }

  async trackPresence(id: string, sessionId: string) {
    const { data } = await Http.post<ApiResponse<{ onlineNow: number }>>(
      `/public/link-pages/${id}/presence`,
      { sessionId },
    );

    return data.data;
  }
}

export default new LinkPagesService();
