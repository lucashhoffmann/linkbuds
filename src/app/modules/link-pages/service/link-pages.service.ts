import { Http, HttpAuth } from '@/app/api/api';
import type {
  AnalyticsEventType,
  AnalyticsTargetType,
  CompanyDomain,
  FooterSettings,
  FormSubmissionsResponse,
  LinkPageAnalyticsGeo,
  LinkPageAnalyticsInsights,
  LinkPageDetail,
  LinkPageImage,
  LinkPageVideo,
  LinkPageText,
  LinkPageLink,
  LinkPageLinkClicksResponse,
  LinkPreview,
  LinkPagesListResponse,
  LinkPagesOverview,
  LinkPageSocialLink,
  PublicLinkPage,
  SocialPlatform,
} from '../types/link-pages.types';
import type { ContentType } from '../utils/content-order.util';
import { guessCountryCode } from '../utils/country-guess.util';

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
  countryCode?: string | null;
  metadata?: Record<string, unknown> | null;
};

class LinkPagesService {
  async list(): Promise<LinkPagesListResponse> {
    const { data } =
      await HttpAuth.get<ApiResponse<LinkPagesListResponse>>('/link-pages');
    return data.data;
  }

  async get(id: string): Promise<LinkPageDetail> {
    const { data } = await HttpAuth.get<ApiResponse<LinkPageDetail>>(
      `/link-pages/${id}`,
    );
    return data.data;
  }

  async overview(): Promise<LinkPagesOverview> {
    const { data } = await HttpAuth.get<ApiResponse<LinkPagesOverview>>(
      '/link-pages/overview',
    );
    return data.data;
  }

  async createPost(
    parentId: string,
    payload: {
      name: string;
      slug: string;
      postNetwork?: SocialPlatform | null;
      postUrl?: string | null;
    },
  ): Promise<LinkPageDetail> {
    const { data } = await HttpAuth.post<ApiResponse<LinkPageDetail>>(
      `/link-pages/${parentId}/posts`,
      payload,
    );
    return data.data;
  }

  async createForm(
    parentId: string,
    payload: { name: string; slug: string },
  ): Promise<LinkPageDetail> {
    const { data } = await HttpAuth.post<ApiResponse<LinkPageDetail>>(
      `/link-pages/${parentId}/forms`,
      payload,
    );
    return data.data;
  }

  async listSubmissions(id: string): Promise<FormSubmissionsResponse> {
    const { data } = await HttpAuth.get<ApiResponse<FormSubmissionsResponse>>(
      `/link-pages/${id}/submissions`,
    );
    return data.data;
  }

  /** Pushes answers not yet in the form's Google Sheet. */
  async resendSubmissions(
    id: string,
  ): Promise<{ sent: number; failed: number }> {
    const { data } = await HttpAuth.post<
      ApiResponse<{ sent: number; failed: number }>
    >(`/link-pages/${id}/submissions/resend`);
    return data.data;
  }

  /** Close now, or reopen (optionally as a new cohort with a new limit). */
  async setFormState(
    id: string,
    payload: {
      closed: boolean;
      cohort?: string;
      maxResponses?: number | null;
    },
  ): Promise<LinkPageDetail> {
    const { data } = await HttpAuth.patch<ApiResponse<LinkPageDetail>>(
      `/link-pages/${id}/form/state`,
      payload,
    );
    return data.data;
  }

  async deleteSubmission(id: string, submissionId: string) {
    await HttpAuth.delete(`/link-pages/${id}/submissions/${submissionId}`);
  }

  /** Public: plain `Http`, so a 4xx stays on the page (shown inline). */
  async submitForm(
    id: string,
    payload: {
      answers: Record<string, string | boolean | string[]>;
      visitorId?: string | null;
      website?: string;
      durationMs?: number | null;
    },
  ) {
    const { data } = await Http.post<
      ApiResponse<{ score: { score: number; max: number } | null }>
    >(`/public/link-pages/${id}/submissions`, payload);
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

  async getFooterDefault(): Promise<FooterSettings> {
    const { data } = await HttpAuth.get<ApiResponse<FooterSettings>>(
      '/link-pages/footer-default',
    );
    return data.data;
  }

  async updateFooterDefault(
    payload: FooterSettings & { applyToExisting: boolean },
  ): Promise<FooterSettings> {
    const { data } = await HttpAuth.put<ApiResponse<FooterSettings>>(
      '/link-pages/footer-default',
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

  async getLinkPreview(url: string): Promise<LinkPreview> {
    const { data } = await HttpAuth.get<ApiResponse<LinkPreview>>(
      '/link-pages/link-preview',
      // Preview is optional: a server error must not leave the open form.
      { params: { url }, keepPageOnServerError: true },
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

  /** One shared order for links, images, videos and texts. */
  async reorderContent(
    id: string,
    payload: Array<{ type: ContentType; id: string; sortOrder: number }>,
  ) {
    await HttpAuth.patch(`/link-pages/${id}/content/reorder`, payload);
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

  async deleteImage(id: string, imageId: string) {
    await HttpAuth.delete(`/link-pages/${id}/images/${imageId}`);
  }

  async createVideo(id: string, payload: Omit<LinkPageVideo, 'id'>) {
    const { data } = await HttpAuth.post<ApiResponse<LinkPageVideo>>(
      `/link-pages/${id}/videos`,
      payload,
    );
    return data.data;
  }

  async updateVideo(
    id: string,
    videoId: string,
    payload: Partial<Omit<LinkPageVideo, 'id'>>,
  ) {
    const { data } = await HttpAuth.patch<ApiResponse<LinkPageVideo>>(
      `/link-pages/${id}/videos/${videoId}`,
      payload,
    );
    return data.data;
  }

  async deleteVideo(id: string, videoId: string) {
    await HttpAuth.delete(`/link-pages/${id}/videos/${videoId}`);
  }

  async createText(id: string, payload: Omit<LinkPageText, 'id'>) {
    const { data } = await HttpAuth.post<ApiResponse<LinkPageText>>(
      `/link-pages/${id}/texts`,
      payload,
    );
    return data.data;
  }

  async updateText(
    id: string,
    textId: string,
    payload: Partial<Omit<LinkPageText, 'id'>>,
  ) {
    const { data } = await HttpAuth.patch<ApiResponse<LinkPageText>>(
      `/link-pages/${id}/texts/${textId}`,
      payload,
    );
    return data.data;
  }

  async deleteText(id: string, textId: string) {
    await HttpAuth.delete(`/link-pages/${id}/texts/${textId}`);
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

  async analyticsGeo(
    id: string,
    params: { realtime: boolean; from?: string; to?: string },
  ): Promise<LinkPageAnalyticsGeo> {
    const searchParams = new URLSearchParams({
      realtime: String(params.realtime),
    });

    if (params.from) searchParams.set('from', params.from);
    if (params.to) searchParams.set('to', params.to);

    const { data } = await HttpAuth.get<ApiResponse<LinkPageAnalyticsGeo>>(
      `/link-pages/${id}/analytics/geo?${searchParams}`,
    );

    return data.data;
  }

  async analyticsLinkClicks(id: string): Promise<LinkPageLinkClicksResponse> {
    const { data } = await HttpAuth.get<
      ApiResponse<LinkPageLinkClicksResponse>
    >(`/link-pages/${id}/analytics/link-clicks`);

    return data.data;
  }

  async getDomain(): Promise<CompanyDomain | null> {
    const { data } =
      await HttpAuth.get<ApiResponse<CompanyDomain | null>>('/company/domain');
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

  async trackEvent(id: string, payload: TrackEventPayload) {
    await Http.post(`/public/link-pages/${id}/events`, {
      countryCode: guessCountryCode(),
      ...payload,
    });
  }

  trackEventBeacon(id: string, payload: TrackEventPayload) {
    const baseUrl = String(Http.defaults.baseURL ?? '').replace(/\/$/, '');
    const url = `${baseUrl}/public/link-pages/${id}/events`;
    const body = new Blob(
      [JSON.stringify({ countryCode: guessCountryCode(), ...payload })],
      {
        type: 'application/json',
      },
    );

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
