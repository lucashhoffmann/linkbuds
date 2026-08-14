export type LinkPageType = 'AGENCY' | 'CLIENT';
export type LinkPageStatus = 'ACTIVE' | 'INACTIVE';
export type LinkPageLayout = 'LAYOUT_1' | 'LAYOUT_2' | 'LAYOUT_3';
export type LinkPageBackgroundType = 'SOLID' | 'IMAGE';
export type LinkPageFooterMode = 'LINKSBUDS' | 'CUSTOM' | 'HIDDEN';
export type LinkPageLinkPlacement = 'HORIZONTAL' | 'VERTICAL';
export type LinkPageLinkKind = 'LINK' | 'CONTACT';
export type LinkPageContactType = 'WHATSAPP' | 'EMAIL' | 'PHONE';
export type SocialPlatform =
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'TIKTOK'
  | 'YOUTUBE'
  | 'LINKEDIN'
  | 'X'
  | 'WHATSAPP'
  | 'GITHUB'
  | 'PINTEREST';

export type AnalyticsEventType =
  | 'PAGE_VIEW'
  | 'PAGE_EXIT'
  | 'LINK_CLICK'
  | 'SOCIAL_CLICK'
  | 'IMAGE_CLICK';

export type AnalyticsTargetType =
  | 'HORIZONTAL_LINK'
  | 'VERTICAL_LINK'
  | 'SOCIAL_LINK'
  | 'IMAGE';

export type LinkPageLink = {
  id: string;
  placement: LinkPageLinkPlacement;
  kind: LinkPageLinkKind;
  label: string;
  url: string | null;
  contactType: LinkPageContactType | null;
  contactValue: string | null;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderEnabled: boolean;
  sortOrder: number;
  active: boolean;
};

export type LinkPageSocialLink = {
  id: string;
  platform: SocialPlatform;
  url: string;
  sortOrder: number;
  active: boolean;
};

export type LinkPageImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  targetUrl: string | null;
  sortOrder: number;
  active: boolean;
};

export type LinkPageSummary = {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  type: LinkPageType;
  status: LinkPageStatus;
  layout: LinkPageLayout;
  title: string;
  subtitle: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LinkPageDetail = LinkPageSummary & {
  backgroundType: LinkPageBackgroundType;
  backgroundColor: string;
  backgroundImageUrl: string | null;
  avatarUrl: string | null;
  footerMode: LinkPageFooterMode;
  footerText: string | null;
  footerUrl: string | null;
  footerLogoUrl: string | null;
  links: LinkPageLink[];
  socialLinks: LinkPageSocialLink[];
  images: LinkPageImage[];
};

export type PublicLinkPage = Omit<
  LinkPageDetail,
  'companyId' | 'type' | 'createdAt' | 'updatedAt'
>;

export type LinkPagesUsage = {
  usedClientPages: number;
  maxClientPages: number;
  remainingClientPages: number;
};

export type LinkPagesListResponse = {
  items: LinkPageSummary[];
  usage: LinkPagesUsage;
};

export type LinkPageAnalyticsSummary = {
  onlineNow: number;
  pageViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  clickThroughRate: number;
  averageDurationMs: number;
};

export type LinkPageAnalyticsTier = 'BASIC' | 'FULL';

export type LinkPageAnalyticsTarget = {
  targetId: string;
  targetType: AnalyticsTargetType;
  clicks: number | string;
};

export type LinkPageAnalyticsTimeseriesPoint = {
  date: string;
  count: number | string;
};

export type LinkPageAnalyticsGroupItem = {
  label: string;
  count: number | string;
};

export type LinkPageAnalyticsInsights = {
  tier: LinkPageAnalyticsTier;
  range: {
    from: string;
    to: string;
  };
  summary: LinkPageAnalyticsSummary;
  topTargets: LinkPageAnalyticsTarget[];
  timeseries: LinkPageAnalyticsTimeseriesPoint[];
  sources: LinkPageAnalyticsGroupItem[];
  devices: LinkPageAnalyticsGroupItem[];
  countries: LinkPageAnalyticsGroupItem[];
  limits: {
    maxRangeDays: number | null;
    advancedDimensionsEnabled: boolean;
  };
};

export type LinkPageLinkClickCount = {
  linkId: string;
  clicks: number | string;
};

export type LinkPageLinkClicksResponse = {
  items: LinkPageLinkClickCount[];
};

export type CompanyDomain = {
  id: string;
  hostname: string;
  status: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'FAILED';
  verificationToken: string;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  dnsInstructions: {
    type: string;
    name: string;
    value: string;
    verificationToken: string;
  };
};

export type LinkPageViewModel = LinkPageDetail | PublicLinkPage;
